class BuzzerAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays a single short piezo buzzer tone (~2400 Hz)
   */
  public beep(frequency = 2400, durationMs = 85, volume = 0.25): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted) {
        setTimeout(resolve, durationMs);
        return;
      }

      try {
        this.initContext();
        if (!this.ctx) {
          resolve();
          return;
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square'; // Piezo buzzers generate rich harmonic square waves
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        const startTime = this.ctx.currentTime;
        const stopTime = startTime + durationMs / 1000;

        // Envelope: quick attack, flat sustain, quick release
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.008);
        gain.gain.setValueAtTime(volume, stopTime - 0.012);
        gain.gain.linearRampToValueAtTime(0.0001, stopTime);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(stopTime);

        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
          resolve();
        };
      } catch (e) {
        console.warn('Audio playback not permitted yet or failed:', e);
        setTimeout(resolve, durationMs);
      }
    });
  }

  /**
   * Triggers a sequence of 1, 2, or 3 pulses
   * onPulse callback gives current pulse index (1, 2, 3)
   */
  public async playPattern(
    pulseCount: 1 | 2 | 3,
    onPulse?: (currentPulseIndex: number) => void
  ): Promise<void> {
    for (let i = 1; i <= pulseCount; i++) {
      if (onPulse) onPulse(i);
      await this.beep(2300, 95, 0.28);
      if (i < pulseCount) {
        await new Promise((res) => setTimeout(res, 90)); // Pause between pulses
      }
    }
  }
}

export const buzzerAudio = new BuzzerAudioSynthesizer();
