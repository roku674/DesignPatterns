/**
 * Facade Pattern - Home Theater System Example
 *
 * The Facade pattern provides a unified interface to a set of interfaces
 * in a subsystem. It defines a higher-level interface that makes the
 * subsystem easier to use.
 */

// ============= Complex Subsystem Classes =============

class Amplifier {
  on() {
    console.log('  [Amplifier] Turning on');
  }

  off() {
    console.log('  [Amplifier] Turning off');
  }

  setVolume(level) {
    console.log(`  [Amplifier] Setting volume to ${level}`);
  }

  setSurroundSound() {
    console.log('  [Amplifier] Setting surround sound mode');
  }

  setStereoSound() {
    console.log('  [Amplifier] Setting stereo sound mode');
  }
}

class DVDPlayer {
  on() {
    console.log('  [DVD Player] Turning on');
  }

  off() {
    console.log('  [DVD Player] Turning off');
  }

  play(movie) {
    console.log(`  [DVD Player] Playing "${movie}"`);
  }

  stop() {
    console.log('  [DVD Player] Stopping');
  }

  eject() {
    console.log('  [DVD Player] Ejecting disc');
  }
}

class Projector {
  on() {
    console.log('  [Projector] Turning on');
  }

  off() {
    console.log('  [Projector] Turning off');
  }

  wideScreenMode() {
    console.log('  [Projector] Setting wide screen mode (16:9)');
  }

  standardMode() {
    console.log('  [Projector] Setting standard mode (4:3)');
  }
}

class Screen {
  down() {
    console.log('  [Screen] Lowering screen');
  }

  up() {
    console.log('  [Screen] Raising screen');
  }
}

class Lights {
  on() {
    console.log('  [Lights] Turning lights on');
  }

  off() {
    console.log('  [Lights] Turning lights off');
  }

  dim(level) {
    console.log(`  [Lights] Dimming to ${level}%`);
  }
}

class PopcornMaker {
  on() {
    console.log('  [Popcorn Maker] Turning on');
  }

  off() {
    console.log('  [Popcorn Maker] Turning off');
  }

  pop() {
    console.log('  [Popcorn Maker] Popping popcorn!');
  }
}

class StreamingPlayer {
  on() {
    console.log('  [Streaming Player] Turning on');
  }

  off() {
    console.log('  [Streaming Player] Turning off');
  }

  play(content) {
    console.log(`  [Streaming Player] Playing "${content}"`);
  }

  pause() {
    console.log('  [Streaming Player] Paused');
  }
}

class SoundSystem {
  on() {
    console.log('  [Sound System] Turning on');
  }

  off() {
    console.log('  [Sound System] Turning off');
  }

  setVolume(level) {
    console.log(`  [Sound System] Volume set to ${level}`);
  }

  setSurroundSound() {
    console.log('  [Sound System] Surround sound enabled');
  }
}

// ============= Facade =============

/**
 * HomeTheaterFacade
 * Provides simplified methods to control the complex subsystem
 */
class HomeTheaterFacade {
  constructor(components = {}) {
    this.amp = components.amplifier || new Amplifier();
    this.dvd = components.dvdPlayer || new DVDPlayer();
    this.projector = components.projector || new Projector();
    this.screen = components.screen || new Screen();
    this.lights = components.lights || new Lights();
    this.popcorn = components.popcornMaker || new PopcornMaker();
    this.streaming = components.streamingPlayer || new StreamingPlayer();
    this.sound = components.soundSystem || new SoundSystem();
  }

  /**
   * Simplified method to watch a movie
   */
  watchMovie(movie) {
    console.log('\n🎬 Getting ready to watch a movie...\n');

    this.popcorn.on();
    this.popcorn.pop();

    this.lights.dim(10);

    this.screen.down();

    this.projector.on();
    this.projector.wideScreenMode();

    this.amp.on();
    this.amp.setVolume(50);
    this.amp.setSurroundSound();

    this.dvd.on();
    this.dvd.play(movie);

    console.log('\n✓ Movie is now playing! Enjoy!\n');
  }

  /**
   * Simplified method to end movie
   */
  endMovie() {
    console.log('\n🛑 Shutting down movie theater...\n');

    this.popcorn.off();

    this.lights.on();

    this.screen.up();

    this.dvd.stop();
    this.dvd.eject();
    this.dvd.off();

    this.amp.off();

    this.projector.off();

    console.log('\n✓ Movie theater is shut down\n');
  }

  /**
   * Watch streaming content
   */
  watchStreaming(content) {
    console.log('\n📺 Getting ready to stream...\n');

    this.lights.dim(20);

    this.screen.down();

    this.projector.on();
    this.projector.wideScreenMode();

    this.sound.on();
    this.sound.setVolume(40);
    this.sound.setSurroundSound();

    this.streaming.on();
    this.streaming.play(content);

    console.log('\n✓ Streaming content! Enjoy!\n');
  }

  /**
   * End streaming
   */
  endStreaming() {
    console.log('\n🛑 Ending streaming session...\n');

    this.streaming.pause();
    this.streaming.off();

    this.sound.off();

    this.projector.off();

    this.screen.up();

    this.lights.on();

    console.log('\n✓ Streaming session ended\n');
  }

  /**
   * Listen to music
   */
  listenToMusic() {
    console.log('\n🎵 Setting up for music...\n');

    this.lights.dim(30);

    this.amp.on();
    this.amp.setVolume(30);
    this.amp.setStereoSound();

    console.log('\n✓ Ready for music!\n');
  }

  /**
   * End music session
   */
  endMusic() {
    console.log('\n🛑 Ending music session...\n');

    this.amp.off();

    this.lights.on();

    console.log('\n✓ Music session ended\n');
  }
}

module.exports = {
  HomeTheaterFacade,
  // Export subsystem classes for demonstration
  Amplifier,
  DVDPlayer,
  Projector,
  Screen,
  Lights,
  PopcornMaker,
  StreamingPlayer,
  SoundSystem
};
