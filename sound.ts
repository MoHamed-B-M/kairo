
// Simple Web Audio API wrapper for sound effects
import { AmbientSoundType } from '../types';

let audioCtx: AudioContext | null = null;
let alarmInterval: number | null = null;
let ambientNodes: AudioNode[] = []; // Track all ambient nodes for clean cleanup

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const stopAlarm = () => {
  if (alarmInterval) {
    window.clearInterval(alarmInterval);
    alarmInterval = null;
  }
};

const playCompleteSequence = (ctx: AudioContext) => {
    const now = ctx.currentTime;
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C Major
    frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gn = ctx.createGain();
        osc.connect(gn);
        gn.connect(ctx.destination);
        
        const start = now + i * 0.15;
        osc.frequency.value = freq;
        
        gn.gain.setValueAtTime(0, start);
        gn.gain.linearRampToValueAtTime(0.1, start + 0.05);
        gn.gain.exponentialRampToValueAtTime(0.001, start + 1.5);
        
        osc.start(start);
        osc.stop(start + 1.5);
    });
};

export const playSound = (type: 'start' | 'pause' | 'complete' | 'reset' | 'tick', enabled: boolean) => {
  if (!enabled) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(e => console.error("Audio resume failed", e));
    }

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // For non-complete sounds, simple connect
    if (type !== 'complete') {
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
    }

    switch (type) {
      case 'start':
        // Ascending chime
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;

      case 'pause':
        // Descending quick tone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case 'reset':
        // Short neutral blip
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;

      case 'tick':
        // Crisp mechanical click
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(1200, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.05, now + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        oscillator.start(now);
        oscillator.stop(now + 0.04);
        break;

      case 'complete':
        // Play once immediately
        playCompleteSequence(ctx);
        // Clear any existing loop just in case
        stopAlarm();
        // Loop every 3 seconds until stopped
        alarmInterval = window.setInterval(() => {
            playCompleteSequence(ctx);
        }, 3000);
        break;
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

// --- Ambient Music Generation ---

export const stopAmbientTrack = () => {
    ambientNodes.forEach(node => {
        try { node.disconnect(); } catch(e) {}
        if (node instanceof OscillatorNode) {
             try { node.stop(); } catch(e) {}
        }
    });
    ambientNodes = [];
};

export const playAmbientTrack = (type: AmbientSoundType) => {
    stopAmbientTrack();
    if (type === 'OFF') return;

    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
             ctx.resume().catch(e => console.error("Ambient audio resume failed", e));
        }

        const masterGain = ctx.createGain();
        // Increased gain from 0.05 to 0.3 for better audibility
        masterGain.gain.value = 0.3; 
        masterGain.connect(ctx.destination);
        ambientNodes.push(masterGain);

        if (type === 'DEEP_SPACE') {
            // Drone: 55Hz (A1) + 82.4Hz (E2) + 110Hz (A2)
            // Sine waves for pure, deep sound
            [55, 82.41, 110, 55.5].forEach(freq => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                const oscGain = ctx.createGain();
                oscGain.gain.value = 0.2; // Mix
                osc.connect(oscGain);
                oscGain.connect(masterGain);
                osc.start();
                ambientNodes.push(osc, oscGain);
            });
        } 
        else if (type === 'SERENE_FLOW') {
            // Pad: CMaj7 (C, E, G, B)
            // Triangle waves with LowPass filter for "air"
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Soft cut
            filter.Q.value = 1;
            filter.connect(masterGain);
            ambientNodes.push(filter);

            [130.81, 164.81, 196.00, 246.94].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                
                // Slow LFO for detuning/movement
                const lfo = ctx.createOscillator();
                lfo.frequency.value = 0.1 + (i * 0.05);
                const lfoGain = ctx.createGain();
                lfoGain.gain.value = 2; // +/- 2Hz detune
                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                lfo.start();
                
                const oscGain = ctx.createGain();
                oscGain.gain.value = 0.15;
                
                osc.connect(oscGain);
                oscGain.connect(filter);
                osc.start();
                
                ambientNodes.push(osc, oscGain, lfo, lfoGain);
            });
        }

    } catch (e) {
        console.error("Ambient track failed", e);
    }
};
