# Adapter Pattern

## What is the Adapter Pattern?

The Adapter pattern allows objects with incompatible interfaces to collaborate. It acts as a wrapper between two objects, catching calls for one object and transforming them to a format and interface recognizable by the second object. Also known as the Wrapper pattern.

## When to Use It

- When you want to use an existing class with an incompatible interface
- When you want to create a reusable class that cooperates with unrelated classes
- When you need to use several existing subclasses but don't want to adapt their interface by subclassing
- When you're integrating third-party libraries or legacy code
- When you want to provide a simpler or more convenient interface to a complex subsystem

## Implementation Details

This implementation demonstrates:
- **Target Interface** (`MediaPlayer`) - the interface clients expect
- **Adaptee** (`AdvancedMediaPlayer`) - the incompatible interface
- **Concrete Adaptees** (`VlcPlayer`, `Mp4Player`) - existing classes with incompatible interface
- **Adapter** (`MediaAdapter`) - converts Adaptee interface to Target interface
- **Client** (`AudioPlayer`) - works with Target interface

## Real-World Example

The example demonstrates a media player system where:
- `AudioPlayer` natively supports MP3 format
- External libraries (`VlcPlayer`, `Mp4Player`) have different interfaces
- `MediaAdapter` makes these libraries compatible with `AudioPlayer`
- Users can play multiple formats through a single interface

## How to Compile and Run

```bash
# Compile
javac *.java

# Run
java Main
```

## Expected Output

```
=== Adapter Pattern Demo ===

--- Playing Different Audio Formats ---

Playing MP3 file: song.mp3

Playing MP4 file: video_audio.mp4

Playing VLC file: movie_audio.vlc

Invalid media format: avi. Supported formats: MP3, VLC, MP4

==================================================

--- Playing Multiple Files ---

Attempting to play: favorite_song.mp3
Playing MP3 file: favorite_song.mp3

Attempting to play: workout_music.mp4
Playing MP4 file: workout_music.mp4

Attempting to play: podcast.vlc
Playing VLC file: podcast.vlc

Attempting to play: audiobook.mp3
Playing MP3 file: audiobook.mp3

==================================================

Adapter Pattern Benefits:
- AudioPlayer can play formats it doesn't natively support
- New formats can be added without modifying AudioPlayer
- Incompatible interfaces work together seamlessly
```

## Key Benefits

1. **Single Responsibility Principle** - Separates interface conversion from business logic
2. **Open/Closed Principle** - Can introduce new adapters without breaking existing code
3. **Reusability** - Can reuse existing functionality with incompatible interfaces
4. **Flexibility** - Can adapt multiple adaptees with different interfaces
5. **Integration** - Easy integration of third-party libraries and legacy code

## Pattern Structure

```
Client → Target Interface
              ↑
              |
          Adapter ----→ Adaptee
                       (incompatible interface)
```

## Types of Adapters

### 1. Object Adapter (Used in this implementation)
- Uses composition
- Adapter contains an instance of Adaptee
- More flexible - can adapt Adaptee and its subclasses
- Follows composition over inheritance principle

### 2. Class Adapter
- Uses multiple inheritance (not available in Java)
- Adapter extends both Target and Adaptee
- Available in C++, not in Java (single inheritance)
- Less flexible but more efficient

## Comparison with Other Patterns

- **Adapter vs Bridge**: Adapter makes existing interfaces work together; Bridge separates interface from implementation upfront
- **Adapter vs Decorator**: Adapter changes interface; Decorator adds responsibilities without changing interface
- **Adapter vs Facade**: Adapter wraps one object; Facade provides simplified interface to a subsystem
- **Adapter vs Proxy**: Adapter provides different interface; Proxy provides same interface

## Common Use Cases

- Integrating third-party libraries with incompatible interfaces
- Working with legacy code
- Creating reusable components that work with unforeseen classes
- Supporting multiple data formats (JSON, XML, CSV)
- Database drivers (JDBC adapters for different databases)
- UI frameworks (adapting different widget libraries)
- API versioning (adapting old API to new interface)

## Real-World Examples

### Java Collections Framework
```java
// Arrays.asList() adapts array to List interface
String[] array = {"a", "b", "c"};
List<String> list = Arrays.asList(array);
```

### Java I/O Streams
```java
// InputStreamReader adapts InputStream to Reader interface
InputStream inputStream = new FileInputStream("file.txt");
Reader reader = new InputStreamReader(inputStream);
```

## Implementation Considerations

### When implementing adapters:
1. **Single Responsibility** - Adapter should only convert interfaces
2. **Minimize dependencies** - Keep Adaptee dependencies isolated
3. **Error handling** - Handle unsupported operations gracefully
4. **Documentation** - Clearly document what's being adapted and why
5. **Testing** - Test adapter thoroughly with different inputs

## Advanced Variations

### Two-Way Adapter
Implements both interfaces and can be used as either:
```java
public class TwoWayAdapter implements MediaPlayer, AdvancedMediaPlayer {
    // Implements both interfaces
}
```

### Pluggable Adapter
Uses callbacks or function interfaces for maximum flexibility:
```java
public class PluggableAdapter implements MediaPlayer {
    private Function<String, Void> playFunction;

    public PluggableAdapter(Function<String, Void> playFunction) {
        this.playFunction = playFunction;
    }
}
```

## Common Pitfalls

1. **Over-adaptation** - Don't create adapters when you can modify the source
2. **Deep adapter chains** - Multiple layers of adapters can be confusing
3. **Leaky abstractions** - Don't expose Adaptee details through adapter
4. **Performance overhead** - Adapters add a layer of indirection
5. **Complexity** - Too many adapters can make system hard to understand

## Testing Strategy

Test these scenarios:
- Adapter correctly translates method calls
- Unsupported operations handled gracefully
- Adapter works with different Adaptee implementations
- No data is lost in translation
- Performance is acceptable

## Best Practices

1. Use Object Adapter (composition) over Class Adapter in Java
2. Keep adapter focused on interface conversion
3. Consider creating adapters for families of related classes
4. Document the mismatch being resolved
5. Use meaningful names (e.g., `LegacyUserAdapter`, `ThirdPartyAPIAdapter`)
6. Consider using Adapter pattern with Factory pattern for creating adapters
