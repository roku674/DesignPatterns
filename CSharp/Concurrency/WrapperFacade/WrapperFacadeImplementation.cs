using System;
using System.Runtime.InteropServices;
using System.Text;

namespace Concurrency.WrapperFacade;

/// <summary>
/// Low-level Win32 API declarations
/// These are the raw P/Invoke declarations that would be difficult to use directly
/// </summary>
internal static class Win32Native
{
    [DllImport("kernel32.dll")]
    internal static extern IntPtr GetCurrentThread();

    [DllImport("kernel32.dll")]
    internal static extern uint GetCurrentThreadId();

    [DllImport("kernel32.dll", SetLastError = true)]
    internal static extern bool GetComputerNameEx(
        int nameType,
        StringBuilder lpBuffer,
        ref uint lpnSize);

    [DllImport("kernel32.dll", SetLastError = true)]
    internal static extern IntPtr CreateMutex(
        IntPtr lpMutexAttributes,
        bool bInitialOwner,
        string lpName);

    [DllImport("kernel32.dll", SetLastError = true)]
    internal static extern bool ReleaseMutex(IntPtr hMutex);

    [DllImport("kernel32.dll", SetLastError = true)]
    internal static extern bool CloseHandle(IntPtr hObject);

    [DllImport("kernel32.dll", SetLastError = true)]
    internal static extern uint WaitForSingleObject(IntPtr hHandle, uint dwMilliseconds);

    internal const uint WAIT_OBJECT_0 = 0x00000000;
    internal const uint WAIT_TIMEOUT = 0x00000102;
    internal const uint INFINITE = 0xFFFFFFFF;
}

/// <summary>
/// High-level wrapper for thread information
/// Provides type-safe, easy-to-use interface
/// </summary>
public class ThreadInfo
{
    public IntPtr Handle { get; }
    public uint Id { get; }

    internal ThreadInfo(IntPtr handle, uint id)
    {
        Handle = handle;
        Id = id;
    }

    public override string ToString()
    {
        return $"Thread ID: {Id}, Handle: 0x{Handle:X}";
    }
}

/// <summary>
/// High-level wrapper for system mutex
/// Encapsulates resource management and provides RAII semantics
/// </summary>
public class SystemMutex : IDisposable
{
    private IntPtr _handle;
    private readonly string _name;
    private bool _disposed;

    public string Name => _name;
    public bool IsValid => _handle != IntPtr.Zero;

    internal SystemMutex(string name, bool initialOwner)
    {
        _name = name ?? throw new ArgumentNullException(nameof(name));
        _handle = Win32Native.CreateMutex(IntPtr.Zero, initialOwner, name);

        if (_handle == IntPtr.Zero)
        {
            throw new InvalidOperationException(
                $"Failed to create mutex '{name}'. Error: {Marshal.GetLastWin32Error()}");
        }
    }

    public bool WaitOne(uint timeoutMs = Win32Native.INFINITE)
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(nameof(SystemMutex));
        }

        uint result = Win32Native.WaitForSingleObject(_handle, timeoutMs);
        return result == Win32Native.WAIT_OBJECT_0;
    }

    public bool Release()
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(nameof(SystemMutex));
        }

        return Win32Native.ReleaseMutex(_handle);
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (_handle != IntPtr.Zero)
            {
                Win32Native.CloseHandle(_handle);
                _handle = IntPtr.Zero;
            }
            _disposed = true;
        }
    }

    ~SystemMutex()
    {
        Dispose(false);
    }
}

/// <summary>
/// Concrete implementation of WrapperFacade pattern.
/// Demonstrates wrapping Win32 API with high-level, type-safe interface
/// </summary>
public class WrapperFacadeImplementation : IWrapperFacade
{
    public void Execute()
    {
        Console.WriteLine("WrapperFacade pattern executing...\n");

        // Demonstrate thread information wrapper
        DemonstrateThreadInfo();
        Console.WriteLine();

        // Demonstrate computer name wrapper
        DemonstrateComputerName();
        Console.WriteLine();

        // Demonstrate mutex wrapper with RAII
        DemonstrateMutexWrapper();
        Console.WriteLine();

        // Demonstrate mutex timeout
        DemonstrateMutexTimeout();
    }

    /// <summary>
    /// Gets current thread information using high-level wrapper
    /// </summary>
    public ThreadInfo GetCurrentThreadInfo()
    {
        IntPtr handle = Win32Native.GetCurrentThread();
        uint id = Win32Native.GetCurrentThreadId();
        return new ThreadInfo(handle, id);
    }

    /// <summary>
    /// Gets computer name using high-level wrapper
    /// </summary>
    public string GetComputerName()
    {
        const int ComputerNameDnsHostname = 1;
        uint size = 256;
        StringBuilder buffer = new StringBuilder((int)size);

        bool success = Win32Native.GetComputerNameEx(
            ComputerNameDnsHostname,
            buffer,
            ref size);

        if (!success)
        {
            throw new InvalidOperationException(
                $"Failed to get computer name. Error: {Marshal.GetLastWin32Error()}");
        }

        return buffer.ToString();
    }

    /// <summary>
    /// Creates a system mutex with RAII semantics
    /// </summary>
    public SystemMutex CreateMutex(string name, bool initialOwner = false)
    {
        return new SystemMutex(name, initialOwner);
    }

    private void DemonstrateThreadInfo()
    {
        Console.WriteLine("1. Thread Information Wrapper:");
        Console.WriteLine("   (Wraps GetCurrentThread and GetCurrentThreadId)");

        ThreadInfo threadInfo = GetCurrentThreadInfo();
        Console.WriteLine($"   {threadInfo}");
        Console.WriteLine("   Benefits: Type-safe, encapsulated, easy to use");
    }

    private void DemonstrateComputerName()
    {
        Console.WriteLine("2. Computer Name Wrapper:");
        Console.WriteLine("   (Wraps GetComputerNameEx with complex parameters)");

        try
        {
            string computerName = GetComputerName();
            Console.WriteLine($"   Computer Name: {computerName}");
            Console.WriteLine("   Benefits: Hides complexity, manages buffers automatically");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"   Error: {ex.Message}");
        }
    }

    private void DemonstrateMutexWrapper()
    {
        Console.WriteLine("3. Mutex Wrapper with RAII:");
        Console.WriteLine("   (Wraps CreateMutex, WaitForSingleObject, ReleaseMutex, CloseHandle)");

        string mutexName = $"Global\\WrapperFacadeDemo_{Guid.NewGuid():N}";

        using (SystemMutex mutex = CreateMutex(mutexName, false))
        {
            Console.WriteLine($"   Created mutex: {mutex.Name}");
            Console.WriteLine($"   Mutex is valid: {mutex.IsValid}");

            Console.WriteLine("   Acquiring mutex...");
            bool acquired = mutex.WaitOne(1000);
            Console.WriteLine($"   Mutex acquired: {acquired}");

            if (acquired)
            {
                Console.WriteLine("   Performing critical section work...");
                System.Threading.Thread.Sleep(100);

                bool released = mutex.Release();
                Console.WriteLine($"   Mutex released: {released}");
            }

            Console.WriteLine("   Benefits: Automatic cleanup, exception-safe, RAII semantics");
        } // Mutex automatically disposed here

        Console.WriteLine("   Mutex automatically disposed (handle closed)");
    }

    private void DemonstrateMutexTimeout()
    {
        Console.WriteLine("4. Mutex Timeout Example:");
        Console.WriteLine("   (Demonstrates timeout handling)");

        string mutexName = $"Global\\WrapperFacadeTimeout_{Guid.NewGuid():N}";

        using (SystemMutex mutex1 = CreateMutex(mutexName, true))
        {
            Console.WriteLine($"   Thread 1: Acquired mutex '{mutexName}'");

            // Try to acquire from same thread with timeout
            using (SystemMutex mutex2 = CreateMutex(mutexName, false))
            {
                Console.WriteLine("   Thread 1: Trying to acquire again with 500ms timeout...");
                bool acquired = mutex2.WaitOne(500);
                Console.WriteLine($"   Thread 1: Second acquire result: {acquired} (should be false - timeout)");
            }

            // Release first mutex
            mutex1.Release();
            Console.WriteLine("   Thread 1: Released mutex");
        }

        Console.WriteLine("   Benefits: Clean timeout handling, no raw Win32 constants exposed");
    }
}
