using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DesignPatterns.Behavioral.Mediator
{
    // Real Mediator pattern implementation
    // Use case: Chat room with multiple users and moderation features

    // Message types
    public enum MessageType
    {
        Text,
        Image,
        File,
        System
    }

    public class Message
    {
        public string Id { get; set; }
        public string SenderId { get; set; }
        public string Content { get; set; }
        public MessageType Type { get; set; }
        public DateTime Timestamp { get; set; }
        public bool IsDeleted { get; set; }

        public Message(string senderId, string content, MessageType type)
        {
            Id = Guid.NewGuid().ToString();
            SenderId = senderId;
            Content = content;
            Type = type;
            Timestamp = DateTime.UtcNow;
            IsDeleted = false;
        }
    }

    // Mediator interface
    public interface IChatMediator
    {
        void RegisterUser(User user);
        void UnregisterUser(User user);
        Task SendMessageAsync(Message message, User sender);
        Task SendDirectMessageAsync(Message message, User sender, User recipient);
        Task BroadcastSystemMessageAsync(string content);
        List<Message> GetMessageHistory(int count);
        List<User> GetActiveUsers();
    }

    // Concrete mediator (Chat Room)
    public class ChatRoom : IChatMediator
    {
        private readonly string _roomName;
        private readonly List<User> _users;
        private readonly List<Message> _messageHistory;
        private readonly Dictionary<string, int> _userMessageCount;
        private readonly int _maxMessagesPerMinute;
        private readonly object _lockObject = new object();

        public ChatRoom(string roomName, int maxMessagesPerMinute = 10)
        {
            _roomName = roomName ?? throw new ArgumentNullException(nameof(roomName));
            _users = new List<User>();
            _messageHistory = new List<Message>();
            _userMessageCount = new Dictionary<string, int>();
            _maxMessagesPerMinute = maxMessagesPerMinute;
        }

        public string RoomName => _roomName;

        public void RegisterUser(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            lock (_lockObject)
            {
                if (!_users.Contains(user))
                {
                    _users.Add(user);
                    _userMessageCount[user.Id] = 0;
                    Console.WriteLine($"[CHAT ROOM] {user.Username} joined '{_roomName}'");

                    Task.Run(async () => await BroadcastSystemMessageAsync($"{user.Username} has joined the chat"));
                }
            }
        }

        public void UnregisterUser(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            lock (_lockObject)
            {
                if (_users.Remove(user))
                {
                    Console.WriteLine($"[CHAT ROOM] {user.Username} left '{_roomName}'");

                    Task.Run(async () => await BroadcastSystemMessageAsync($"{user.Username} has left the chat"));
                }
            }
        }

        public async Task SendMessageAsync(Message message, User sender)
        {
            if (message == null)
            {
                throw new ArgumentNullException(nameof(message));
            }
            if (sender == null)
            {
                throw new ArgumentNullException(nameof(sender));
            }

            // Check rate limiting
            lock (_lockObject)
            {
                if (!_users.Contains(sender))
                {
                    throw new InvalidOperationException($"User {sender.Username} is not in the chat room");
                }

                if (_userMessageCount[sender.Id] >= _maxMessagesPerMinute)
                {
                    await sender.ReceiveNotificationAsync($"You are sending messages too quickly. Please wait a moment.");
                    return;
                }

                _userMessageCount[sender.Id]++;
            }

            // Check for banned words (content moderation)
            string[] bannedWords = { "spam", "badword", "offensive" };
            bool containsBannedWords = bannedWords.Any(word =>
                message.Content.Contains(word, StringComparison.OrdinalIgnoreCase));

            if (containsBannedWords)
            {
                message.Content = "[MESSAGE BLOCKED BY MODERATOR]";
                await sender.ReceiveNotificationAsync("Your message was blocked due to inappropriate content.");
            }

            lock (_lockObject)
            {
                _messageHistory.Add(message);
            }

            Console.WriteLine($"[CHAT ROOM] {sender.Username}: {message.Content}");

            // Notify all users except sender
            List<User> recipients = null;
            lock (_lockObject)
            {
                recipients = _users.Where(u => u.Id != sender.Id).ToList();
            }

            List<Task> notificationTasks = recipients.Select(user => user.ReceiveMessageAsync(message, sender)).ToList();
            await Task.WhenAll(notificationTasks);

            // Reset message count after 1 minute (simplified simulation)
            Task.Run(async () =>
            {
                await Task.Delay(60000);
                lock (_lockObject)
                {
                    if (_userMessageCount.ContainsKey(sender.Id))
                    {
                        _userMessageCount[sender.Id] = Math.Max(0, _userMessageCount[sender.Id] - 1);
                    }
                }
            });
        }

        public async Task SendDirectMessageAsync(Message message, User sender, User recipient)
        {
            if (message == null)
            {
                throw new ArgumentNullException(nameof(message));
            }
            if (sender == null)
            {
                throw new ArgumentNullException(nameof(sender));
            }
            if (recipient == null)
            {
                throw new ArgumentNullException(nameof(recipient));
            }

            lock (_lockObject)
            {
                if (!_users.Contains(sender) || !_users.Contains(recipient))
                {
                    throw new InvalidOperationException("Both users must be in the chat room");
                }

                _messageHistory.Add(message);
            }

            Console.WriteLine($"[CHAT ROOM] DM from {sender.Username} to {recipient.Username}: {message.Content}");

            await recipient.ReceiveDirectMessageAsync(message, sender);
        }

        public async Task BroadcastSystemMessageAsync(string content)
        {
            Message systemMessage = new Message("SYSTEM", content, MessageType.System);

            lock (_lockObject)
            {
                _messageHistory.Add(systemMessage);
            }

            Console.WriteLine($"[CHAT ROOM] SYSTEM: {content}");

            List<User> users = null;
            lock (_lockObject)
            {
                users = _users.ToList();
            }

            List<Task> notificationTasks = users.Select(user => user.ReceiveSystemMessageAsync(systemMessage)).ToList();
            await Task.WhenAll(notificationTasks);
        }

        public List<Message> GetMessageHistory(int count)
        {
            lock (_lockObject)
            {
                return _messageHistory
                    .Where(m => !m.IsDeleted)
                    .OrderByDescending(m => m.Timestamp)
                    .Take(count)
                    .OrderBy(m => m.Timestamp)
                    .ToList();
            }
        }

        public List<User> GetActiveUsers()
        {
            lock (_lockObject)
            {
                return new List<User>(_users);
            }
        }

        public int MessageCount
        {
            get
            {
                lock (_lockObject)
                {
                    return _messageHistory.Count(m => !m.IsDeleted);
                }
            }
        }
    }

    // Colleague (User)
    public abstract class User
    {
        protected IChatMediator _mediator;
        private readonly List<Message> _receivedMessages;
        private readonly object _lockObject = new object();

        public string Id { get; private set; }
        public string Username { get; private set; }

        protected User(string username)
        {
            Id = Guid.NewGuid().ToString();
            Username = username ?? throw new ArgumentNullException(nameof(username));
            _receivedMessages = new List<Message>();
        }

        public void SetMediator(IChatMediator mediator)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        public async Task SendMessageAsync(string content, MessageType type = MessageType.Text)
        {
            if (_mediator == null)
            {
                throw new InvalidOperationException("User is not connected to a chat room");
            }

            Message message = new Message(Id, content, type);
            await _mediator.SendMessageAsync(message, this);
        }

        public async Task SendDirectMessageAsync(User recipient, string content)
        {
            if (_mediator == null)
            {
                throw new InvalidOperationException("User is not connected to a chat room");
            }

            Message message = new Message(Id, content, MessageType.Text);
            await _mediator.SendDirectMessageAsync(message, this, recipient);
        }

        public virtual async Task ReceiveMessageAsync(Message message, User sender)
        {
            lock (_lockObject)
            {
                _receivedMessages.Add(message);
            }
            await ProcessMessageAsync(message, sender);
        }

        public virtual async Task ReceiveDirectMessageAsync(Message message, User sender)
        {
            lock (_lockObject)
            {
                _receivedMessages.Add(message);
            }
            await ProcessDirectMessageAsync(message, sender);
        }

        public virtual async Task ReceiveSystemMessageAsync(Message message)
        {
            lock (_lockObject)
            {
                _receivedMessages.Add(message);
            }
            await ProcessSystemMessageAsync(message);
        }

        public virtual async Task ReceiveNotificationAsync(string notification)
        {
            await Task.Run(() => Console.WriteLine($"[{Username}] NOTIFICATION: {notification}"));
        }

        protected abstract Task ProcessMessageAsync(Message message, User sender);
        protected abstract Task ProcessDirectMessageAsync(Message message, User sender);
        protected abstract Task ProcessSystemMessageAsync(Message message);

        public int ReceivedMessageCount
        {
            get
            {
                lock (_lockObject)
                {
                    return _receivedMessages.Count;
                }
            }
        }
    }

    // Concrete user types
    public class RegularUser : User
    {
        public RegularUser(string username) : base(username) { }

        protected override async Task ProcessMessageAsync(Message message, User sender)
        {
            await Task.Run(() =>
            {
                Console.WriteLine($"[{Username}] Received from {sender.Username}: {message.Content}");
            });
        }

        protected override async Task ProcessDirectMessageAsync(Message message, User sender)
        {
            await Task.Run(() =>
            {
                Console.WriteLine($"[{Username}] DM from {sender.Username}: {message.Content}");
            });
        }

        protected override async Task ProcessSystemMessageAsync(Message message)
        {
            await Task.Run(() =>
            {
                Console.WriteLine($"[{Username}] SYSTEM: {message.Content}");
            });
        }
    }

    public class ModeratorUser : User
    {
        private readonly List<string> _moderationLog;

        public ModeratorUser(string username) : base(username)
        {
            _moderationLog = new List<string>();
        }

        protected override async Task ProcessMessageAsync(Message message, User sender)
        {
            await Task.Run(() =>
            {
                // Moderators see all messages and can take action
                string logEntry = $"[MODERATOR {Username}] Message from {sender.Username}: {message.Content}";
                _moderationLog.Add(logEntry);
                Console.WriteLine(logEntry);
            });
        }

        protected override async Task ProcessDirectMessageAsync(Message message, User sender)
        {
            await Task.Run(() =>
            {
                Console.WriteLine($"[MODERATOR {Username}] DM from {sender.Username}: {message.Content}");
            });
        }

        protected override async Task ProcessSystemMessageAsync(Message message)
        {
            await Task.Run(() =>
            {
                Console.WriteLine($"[MODERATOR {Username}] SYSTEM: {message.Content}");
            });
        }

        public List<string> GetModerationLog()
        {
            return new List<string>(_moderationLog);
        }
    }

    public class BotUser : User
    {
        private readonly Dictionary<string, string> _responses;

        public BotUser(string username) : base(username)
        {
            _responses = new Dictionary<string, string>
            {
                { "hello", "Hello! How can I help you today?" },
                { "help", "Available commands: hello, help, time, users" },
                { "time", $"Current time is {DateTime.UtcNow:HH:mm:ss} UTC" },
                { "users", "Use /users to see active users" }
            };
        }

        protected override async Task ProcessMessageAsync(Message message, User sender)
        {
            await Task.Run(async () =>
            {
                Console.WriteLine($"[BOT {Username}] Processing message from {sender.Username}: {message.Content}");

                string messageLower = message.Content.ToLower();
                foreach (KeyValuePair<string, string> kvp in _responses)
                {
                    if (messageLower.Contains(kvp.Key))
                    {
                        await Task.Delay(500); // Simulate thinking
                        await SendMessageAsync($"@{sender.Username} {kvp.Value}");
                        break;
                    }
                }
            });
        }

        protected override async Task ProcessDirectMessageAsync(Message message, User sender)
        {
            await Task.Run(() =>
            {
                Console.WriteLine($"[BOT {Username}] DM from {sender.Username}: {message.Content}");
            });
        }

        protected override async Task ProcessSystemMessageAsync(Message message)
        {
            await Task.Run(() =>
            {
                Console.WriteLine($"[BOT {Username}] SYSTEM: {message.Content}");
            });
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Mediator Pattern - Chat Room System ===\n");

            try
            {
                ChatRoom chatRoom = new ChatRoom("General", maxMessagesPerMinute: 5);

                // Create users
                RegularUser alice = new RegularUser("Alice");
                RegularUser bob = new RegularUser("Bob");
                RegularUser charlie = new RegularUser("Charlie");
                ModeratorUser moderator = new ModeratorUser("ModeratorMike");
                BotUser helpBot = new BotUser("HelpBot");

                // Connect users to chat room
                alice.SetMediator(chatRoom);
                bob.SetMediator(chatRoom);
                charlie.SetMediator(chatRoom);
                moderator.SetMediator(chatRoom);
                helpBot.SetMediator(chatRoom);

                chatRoom.RegisterUser(alice);
                await Task.Delay(200);

                chatRoom.RegisterUser(bob);
                await Task.Delay(200);

                chatRoom.RegisterUser(charlie);
                await Task.Delay(200);

                chatRoom.RegisterUser(moderator);
                await Task.Delay(200);

                chatRoom.RegisterUser(helpBot);
                await Task.Delay(500);

                Console.WriteLine("\n=== Regular Messages ===\n");

                await alice.SendMessageAsync("Hello everyone!");
                await Task.Delay(300);

                await bob.SendMessageAsync("Hi Alice! How are you?");
                await Task.Delay(300);

                await charlie.SendMessageAsync("Hey folks!");
                await Task.Delay(300);

                Console.WriteLine("\n=== Bot Interaction ===\n");

                await alice.SendMessageAsync("hello");
                await Task.Delay(800);

                await bob.SendMessageAsync("Can someone help me?");
                await Task.Delay(800);

                Console.WriteLine("\n=== Direct Messages ===\n");

                await alice.SendDirectMessageAsync(bob, "Bob, can we talk privately?");
                await Task.Delay(300);

                await bob.SendDirectMessageAsync(alice, "Sure Alice, what's up?");
                await Task.Delay(300);

                Console.WriteLine("\n=== Statistics ===");
                Console.WriteLine($"Total messages: {chatRoom.MessageCount}");
                Console.WriteLine($"Active users: {chatRoom.GetActiveUsers().Count}");
                Console.WriteLine($"Alice received: {alice.ReceivedMessageCount} messages");
                Console.WriteLine($"Bob received: {bob.ReceivedMessageCount} messages");
                Console.WriteLine($"Moderator log entries: {moderator.GetModerationLog().Count}");

                Console.WriteLine("\n=== Recent Message History ===");
                List<Message> history = chatRoom.GetMessageHistory(5);
                foreach (Message msg in history)
                {
                    string sender = chatRoom.GetActiveUsers()
                        .FirstOrDefault(u => u.Id == msg.SenderId)?.Username ?? msg.SenderId;
                    Console.WriteLine($"[{msg.Timestamp:HH:mm:ss}] {sender}: {msg.Content}");
                }

                Console.WriteLine("\n=== Pattern Demonstration Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }
    }
}
