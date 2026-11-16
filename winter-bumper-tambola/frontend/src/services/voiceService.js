/**
 * Voice announcement service using Web Speech API
 */

class VoiceService {
  constructor() {
    // Check if window and speechSynthesis are available
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isSupported = !!this.synth;
    this.currentUtterance = null;
    this.isEnabled = false;
    this.voices = [];
    
    // Load voices when they become available
    if (this.isSupported) {
      try {
        this.loadVoices();
        // Some browsers load voices asynchronously
        this.synth.onvoiceschanged = () => this.loadVoices();
      } catch (err) {
        console.error('Voice service init error:', err);
        this.isSupported = false;
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    console.log('Available voices:', this.voices.length);
  }

  /**
   * Check if browser supports Web Speech API
   */
  isVoiceSupported() {
    return this.isSupported;
  }

  /**
   * Enable/disable voice announcements
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Announce a number
   */
  announceNumber(number, options = {}) {
    if (!this.isEnabled || !this.isSupported || !this.synth) {
      console.warn('Voice not enabled or not supported');
      return;
    }

    const {
      lang = 'en-US',
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
    } = options;

    // Convert number to words
    const text = this.numberToWords(number);
    console.log('Announcing:', text);

    // Stop any ongoing speech
    this.stop();

    try {
      // Create new utterance
      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.lang = lang;
      this.currentUtterance.rate = rate;
      this.currentUtterance.pitch = pitch;
      this.currentUtterance.volume = volume;

      // Use a voice if available
      if (this.voices.length > 0) {
        const englishVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
        this.currentUtterance.voice = englishVoice;
      }

      // Speak
      this.synth.speak(this.currentUtterance);
      console.log('Voice speaking:', text);
    } catch (err) {
      console.error('Voice error:', err);
    }
  }

  /**
   * Announce game start message
   */
  announceGameStart(options = {}) {
    if (!this.isEnabled || !this.isSupported || !this.synth) return;

    try {
      const text = 'Game has started. Get ready!';
      this.stop();

      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.lang = options.lang || 'en-US';
      this.currentUtterance.rate = options.rate || 0.9;
      this.currentUtterance.pitch = options.pitch || 1.0;
      this.currentUtterance.volume = options.volume || 1.0;

      this.synth.speak(this.currentUtterance);
    } catch (err) {
      console.error('Voice error:', err);
    }
  }

  /**
   * Announce game over message
   */
  announceGameOver(options = {}) {
    if (!this.isEnabled || !this.isSupported || !this.synth) return;

    try {
      const text = 'Game is over. Thank you for playing!';
      this.stop();

      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.lang = options.lang || 'en-US';
      this.currentUtterance.rate = options.rate || 0.9;
      this.currentUtterance.pitch = options.pitch || 1.0;
      this.currentUtterance.volume = options.volume || 1.0;

      this.synth.speak(this.currentUtterance);
    } catch (err) {
      console.error('Voice error:', err);
    }
  }

  /**
   * Announce winner
   */
  announceWinner(playerName, pattern, options = {}) {
    if (!this.isEnabled || !this.isSupported || !this.synth) return;

    try {
      const text = `${playerName} has won with ${pattern}!`;
      this.stop();

      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.lang = options.lang || 'en-US';
      this.currentUtterance.rate = options.rate || 0.85;
      this.currentUtterance.pitch = options.pitch || 1.2;
      this.currentUtterance.volume = options.volume || 1.0;

      this.synth.speak(this.currentUtterance);
    } catch (err) {
      console.error('Voice error:', err);
    }
  }

  /**
   * Stop current announcement
   */
  stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.currentUtterance = null;
  }

  /**
   * Convert number to words (1-90)
   */
  numberToWords(num) {
    if (num < 1 || num > 90) return String(num);

    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen',
    ];

    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
    ];

    if (num < 20) {
      return ones[num];
    } else if (num < 100) {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    }

    return String(num);
  }

  /**
   * Get available voices
   */
  getAvailableVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  /**
   * Set specific voice
   */
  setVoice(voiceIndex, options = {}) {
    const voices = this.getAvailableVoices();
    if (voiceIndex < 0 || voiceIndex >= voices.length) return;

    const {
      lang = 'en-US',
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
    } = options;

    if (this.currentUtterance) {
      this.currentUtterance.voice = voices[voiceIndex];
      this.currentUtterance.lang = lang;
      this.currentUtterance.rate = rate;
      this.currentUtterance.pitch = pitch;
      this.currentUtterance.volume = volume;
    }
  }
}

// Export singleton instance
const voiceService = new VoiceService();
export default voiceService;
