import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import * as Cesium from 'cesium';

// Palm-center landmark (middle finger MCP) used as the tracked point
const PALM_LANDMARK_INDEX = 9;

// How much hand movement (in normalized 0-1 video-space units) maps to camera rotation (radians)
const ROTATE_SENSITIVITY = 4.0;
const MAX_ROTATE_PER_FRAME = 0.05;

// Exponential smoothing factor for the tracked palm position (higher = smoother but laggier)
const SMOOTHING = 0.7;
// Ignore movement smaller than this (normalized units) — filters out hand-tracking jitter
const DEAD_ZONE = 0.0025;

export default function HandGestureControl({ viewerRef, onUserInteract }) {
    const [enabled, setEnabled] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | loading | tracking | error
    const [errorMsg, setErrorMsg] = useState('');

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const landmarkerRef = useRef(null);
    const rafRef = useRef(null);
    const smoothedPalmRef = useRef(null);

    const stop = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        smoothedPalmRef.current = null;
        setStatus('idle');
    }, []);

    const detectLoop = useCallback(() => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        if (!video || !landmarker || video.readyState < 2) {
            rafRef.current = requestAnimationFrame(detectLoop);
            return;
        }

        const results = landmarker.detectForVideo(video, performance.now());

        if (results.landmarks && results.landmarks.length > 0) {
            const rawPalm = results.landmarks[0][PALM_LANDMARK_INDEX];
            setStatus('tracking');

            const prevSmoothed = smoothedPalmRef.current;
            // Exponential moving average to smooth out raw landmark jitter
            const palm = prevSmoothed
                ? {
                    x: prevSmoothed.x * SMOOTHING + rawPalm.x * (1 - SMOOTHING),
                    y: prevSmoothed.y * SMOOTHING + rawPalm.y * (1 - SMOOTHING),
                }
                : { x: rawPalm.x, y: rawPalm.y };

            if (prevSmoothed) {
                // Mirror horizontal movement (video is mirrored like a selfie cam)
                let dx = prevSmoothed.x - palm.x;
                let dy = palm.y - prevSmoothed.y;

                if (Math.abs(dx) < DEAD_ZONE) dx = 0;
                if (Math.abs(dy) < DEAD_ZONE) dy = 0;

                if (dx !== 0 || dy !== 0) {
                    const viewer = viewerRef.current;
                    if (viewer) {
                        const rotateX = Cesium.Math.clamp(dx * ROTATE_SENSITIVITY, -MAX_ROTATE_PER_FRAME, MAX_ROTATE_PER_FRAME);
                        const rotateY = Cesium.Math.clamp(dy * ROTATE_SENSITIVITY, -MAX_ROTATE_PER_FRAME, MAX_ROTATE_PER_FRAME);

                        if (rotateX > 0) viewer.camera.rotateRight(rotateX);
                        else if (rotateX < 0) viewer.camera.rotateLeft(-rotateX);

                        if (rotateY > 0) viewer.camera.rotateUp(rotateY);
                        else if (rotateY < 0) viewer.camera.rotateDown(-rotateY);
                    }
                    if (onUserInteract) onUserInteract();
                }
            }
            smoothedPalmRef.current = palm;
        } else {
            smoothedPalmRef.current = null;
            setStatus('tracking'); // camera still on, just no hand visible right now
        }

        rafRef.current = requestAnimationFrame(detectLoop);
    }, [viewerRef, onUserInteract]);

    const start = useCallback(async () => {
        setStatus('loading');
        setErrorMsg('');
        // Claim manual camera control immediately so the auto-tour carousel doesn't
        // keep fighting for the Cesium camera while gesture tracking spins up.
        if (onUserInteract) onUserInteract();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            if (!landmarkerRef.current) {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm'
                );
                landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numHands: 1,
                });
            }

            rafRef.current = requestAnimationFrame(detectLoop);
        } catch (err) {
            console.error('Hand gesture control failed to start:', err);
            setErrorMsg(err.message === 'Permission denied' || err.name === 'NotAllowedError'
                ? '摄像头权限被拒绝'
                : '手势识别启动失败');
            setStatus('error');
            stop();
            setEnabled(false);
        }
    }, [detectLoop, stop, onUserInteract]);

    useEffect(() => {
        if (enabled) {
            start();
        } else {
            stop();
        }
        return () => stop();
    }, [enabled]);

    // Stop camera/loop on unmount
    useEffect(() => () => stop(), [stop]);

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '110px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            {enabled && (
                <div style={{
                    width: '120px', height: '90px', borderRadius: '10px', overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    background: '#000',
                }}>
                    <video
                        ref={videoRef}
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                    />
                </div>
            )}

            <button
                onClick={() => setEnabled(v => !v)}
                title={enabled ? '关闭手势控制地球' : '开启手势控制地球（需要摄像头权限）'}
                style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: enabled ? 'rgba(102,126,234,0.85)' : 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white', fontSize: '18px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(6px)',
                }}
            >
                {status === 'loading' ? '⏳' : '✋'}
            </button>

            {status === 'error' && (
                <div style={{
                    fontSize: '0.75rem', color: '#ff8a80', background: 'rgba(0,0,0,0.6)',
                    padding: '4px 10px', borderRadius: '8px', maxWidth: '160px', textAlign: 'right',
                }}>
                    {errorMsg}
                </div>
            )}
        </div>
    );
}
