/**
 * Facade Pattern - Demo
 */

const {
  HomeTheaterFacade,
  Amplifier,
  DVDPlayer,
  Projector,
  Screen,
  Lights,
  PopcornMaker
} = require('./home-theater');

console.log('=== Facade Pattern Demo ===\n');

// Example 1: Without Facade (Complex)
console.log('=== Example 1: WITHOUT Facade (The Hard Way) ===\n');

console.log('Manually controlling each component:\n');

const amp = new Amplifier();
const dvd = new DVDPlayer();
const projector = new Projector();
const screen = new Screen();
const lights = new Lights();
const popcorn = new PopcornMaker();

// Watch movie the hard way
console.log('To watch a movie, I have to:');
popcorn.on();
popcorn.pop();
lights.dim(10);
screen.down();
projector.on();
projector.wideScreenMode();
amp.on();
amp.setVolume(50);
amp.setSurroundSound();
dvd.on();
dvd.play('The Matrix');

console.log('\n(That was 12 steps just to watch a movie!)\n');

// End movie the hard way
console.log('To end the movie:');
popcorn.off();
lights.on();
screen.up();
dvd.stop();
dvd.eject();
dvd.off();
amp.off();
projector.off();

console.log('\n(Another 8 steps to shut down!)\n');

// Example 2: With Facade (Simple)
console.log('\n=== Example 2: WITH Facade (The Easy Way) ===');

const homeTheater = new HomeTheaterFacade();

// Watch movie the easy way
homeTheater.watchMovie('The Matrix');

// (User enjoys the movie...)
console.log('(... enjoying the movie ...)\n');

// End movie the easy way
homeTheater.endMovie();

// Example 3: Watch streaming content
console.log('=== Example 3: Streaming Content ===');

homeTheater.watchStreaming('Stranger Things S04E01');

console.log('(... binge watching ...)\n');

homeTheater.endStreaming();

// Example 4: Listen to music
console.log('=== Example 4: Music Mode ===');

homeTheater.listenToMusic();

console.log('(... listening to favorite playlist ...)\n');

homeTheater.endMusic();

// Example 5: Multiple sessions
console.log('=== Example 5: Movie Night ===\n');

console.log('Movie Marathon:');
homeTheater.watchMovie('Inception');
console.log('(... movie 1 finished ...)');
homeTheater.endMovie();

console.log('(... short break ...)');

homeTheater.watchMovie('Interstellar');
console.log('(... movie 2 finished ...)');
homeTheater.endMovie();

// Example 6: Demonstrating facade benefits
console.log('=== Example 6: Facade Pattern Benefits ===\n');

console.log('WITHOUT Facade:');
console.log('  ✗ Client must know about all subsystem components');
console.log('  ✗ Client must know the correct order of operations');
console.log('  ✗ Client code is tightly coupled to subsystem');
console.log('  ✗ 12+ steps to watch a movie');
console.log('  ✗ Difficult to maintain if subsystem changes');
console.log('  ✗ Error-prone (easy to forget steps)\n');

console.log('WITH Facade:');
console.log('  ✓ Simple interface: watchMovie(), endMovie()');
console.log('  ✓ Client doesn\'t need to know about subsystem');
console.log('  ✓ Loose coupling between client and subsystem');
console.log('  ✓ 1 method call to watch a movie');
console.log('  ✓ Easy to maintain and update');
console.log('  ✓ Prevents errors - correct sequence guaranteed\n');

// Example 7: Custom configuration
console.log('=== Example 7: Custom Component Configuration ===\n');

class QuietAmplifier extends Amplifier {
  setVolume(level) {
    console.log(`  [Quiet Amp] Setting volume to ${level} (max 30)`);
  }
}

const customTheater = new HomeTheaterFacade({
  amplifier: new QuietAmplifier()
});

console.log('Custom home theater with quiet amplifier:');
customTheater.watchMovie('A Quiet Place');
customTheater.endMovie();

console.log('=== Demo Complete ===');
