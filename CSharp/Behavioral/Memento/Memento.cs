using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DesignPatterns.Behavioral.Memento
{
    // Real Memento pattern implementation
    // Use case: Game save system with state snapshots and restore functionality

    // Memento - stores game state
    public class GameMemento
    {
        public string Id { get; private set; }
        public DateTime Timestamp { get; private set; }
        public string SaveName { get; private set; }

        // Player state
        private readonly int _playerHealth;
        private readonly int _playerMana;
        private readonly int _playerLevel;
        private readonly int _playerExperience;
        private readonly string _playerPosition;

        // Inventory state
        private readonly Dictionary<string, int> _inventory;

        // Quest state
        private readonly List<string> _completedQuests;
        private readonly List<string> _activeQuests;

        // Game progress
        private readonly int _checkpointId;
        private readonly TimeSpan _playTime;

        public GameMemento(
            string saveName,
            int playerHealth,
            int playerMana,
            int playerLevel,
            int playerExperience,
            string playerPosition,
            Dictionary<string, int> inventory,
            List<string> completedQuests,
            List<string> activeQuests,
            int checkpointId,
            TimeSpan playTime)
        {
            Id = Guid.NewGuid().ToString();
            Timestamp = DateTime.UtcNow;
            SaveName = saveName ?? "Autosave";

            _playerHealth = playerHealth;
            _playerMana = playerMana;
            _playerLevel = playerLevel;
            _playerExperience = playerExperience;
            _playerPosition = playerPosition ?? "Unknown";

            _inventory = new Dictionary<string, int>(inventory ?? new Dictionary<string, int>());
            _completedQuests = new List<string>(completedQuests ?? new List<string>());
            _activeQuests = new List<string>(activeQuests ?? new List<string>());

            _checkpointId = checkpointId;
            _playTime = playTime;
        }

        // Getters for state data
        public int GetPlayerHealth() => _playerHealth;
        public int GetPlayerMana() => _playerMana;
        public int GetPlayerLevel() => _playerLevel;
        public int GetPlayerExperience() => _playerExperience;
        public string GetPlayerPosition() => _playerPosition;
        public Dictionary<string, int> GetInventory() => new Dictionary<string, int>(_inventory);
        public List<string> GetCompletedQuests() => new List<string>(_completedQuests);
        public List<string> GetActiveQuests() => new List<string>(_activeQuests);
        public int GetCheckpointId() => _checkpointId;
        public TimeSpan GetPlayTime() => _playTime;

        public string GetSummary()
        {
            return $"[{Timestamp:yyyy-MM-dd HH:mm:ss}] {SaveName} - Level {_playerLevel}, " +
                   $"Health: {_playerHealth}, Position: {_playerPosition}, " +
                   $"Quests: {_completedQuests.Count} completed, PlayTime: {_playTime:hh\\:mm\\:ss}";
        }
    }

    // Originator - Game state
    public class GameState
    {
        private int _playerHealth;
        private int _playerMana;
        private int _playerLevel;
        private int _playerExperience;
        private string _playerPosition;
        private Dictionary<string, int> _inventory;
        private List<string> _completedQuests;
        private List<string> _activeQuests;
        private int _checkpointId;
        private DateTime _startTime;

        public GameState()
        {
            // Initialize new game
            _playerHealth = 100;
            _playerMana = 50;
            _playerLevel = 1;
            _playerExperience = 0;
            _playerPosition = "Starting Village";
            _inventory = new Dictionary<string, int>();
            _completedQuests = new List<string>();
            _activeQuests = new List<string> { "Find the Elder" };
            _checkpointId = 0;
            _startTime = DateTime.UtcNow;
        }

        // Game actions that modify state
        public void TakeDamage(int damage)
        {
            _playerHealth = Math.Max(0, _playerHealth - damage);
            Console.WriteLine($"[GAME] Player took {damage} damage. Health: {_playerHealth}");
        }

        public void Heal(int amount)
        {
            _playerHealth = Math.Min(100, _playerHealth + amount);
            Console.WriteLine($"[GAME] Player healed {amount}. Health: {_playerHealth}");
        }

        public void UseMana(int amount)
        {
            _playerMana = Math.Max(0, _playerMana - amount);
            Console.WriteLine($"[GAME] Used {amount} mana. Mana: {_playerMana}");
        }

        public void RestoreMana(int amount)
        {
            _playerMana = Math.Min(100, _playerMana + amount);
            Console.WriteLine($"[GAME] Restored {amount} mana. Mana: {_playerMana}");
        }

        public void GainExperience(int exp)
        {
            _playerExperience += exp;
            Console.WriteLine($"[GAME] Gained {exp} experience. Total: {_playerExperience}");

            // Level up check
            int expNeeded = _playerLevel * 100;
            if (_playerExperience >= expNeeded)
            {
                LevelUp();
            }
        }

        private void LevelUp()
        {
            _playerLevel++;
            _playerExperience = 0;
            _playerHealth = 100;
            _playerMana = 50;
            Console.WriteLine($"[GAME] LEVEL UP! Now level {_playerLevel}");
        }

        public void MoveTo(string location)
        {
            _playerPosition = location;
            Console.WriteLine($"[GAME] Moved to {location}");
        }

        public void AddItem(string item, int quantity = 1)
        {
            if (_inventory.ContainsKey(item))
            {
                _inventory[item] += quantity;
            }
            else
            {
                _inventory[item] = quantity;
            }
            Console.WriteLine($"[GAME] Added {quantity}x {item} to inventory");
        }

        public void RemoveItem(string item, int quantity = 1)
        {
            if (_inventory.ContainsKey(item))
            {
                _inventory[item] -= quantity;
                if (_inventory[item] <= 0)
                {
                    _inventory.Remove(item);
                }
                Console.WriteLine($"[GAME] Removed {quantity}x {item} from inventory");
            }
        }

        public void CompleteQuest(string questName)
        {
            if (_activeQuests.Contains(questName))
            {
                _activeQuests.Remove(questName);
                _completedQuests.Add(questName);
                Console.WriteLine($"[GAME] Quest completed: {questName}");
            }
        }

        public void StartQuest(string questName)
        {
            if (!_activeQuests.Contains(questName))
            {
                _activeQuests.Add(questName);
                Console.WriteLine($"[GAME] Quest started: {questName}");
            }
        }

        public void ReachCheckpoint(int checkpointId)
        {
            _checkpointId = checkpointId;
            Console.WriteLine($"[GAME] Reached checkpoint {checkpointId}");
        }

        // Create memento
        public GameMemento CreateMemento(string saveName)
        {
            TimeSpan playTime = DateTime.UtcNow - _startTime;

            GameMemento memento = new GameMemento(
                saveName,
                _playerHealth,
                _playerMana,
                _playerLevel,
                _playerExperience,
                _playerPosition,
                _inventory,
                _completedQuests,
                _activeQuests,
                _checkpointId,
                playTime
            );

            Console.WriteLine($"[GAME] Game saved: {saveName}");
            return memento;
        }

        // Restore from memento
        public void RestoreFromMemento(GameMemento memento)
        {
            if (memento == null)
            {
                throw new ArgumentNullException(nameof(memento));
            }

            _playerHealth = memento.GetPlayerHealth();
            _playerMana = memento.GetPlayerMana();
            _playerLevel = memento.GetPlayerLevel();
            _playerExperience = memento.GetPlayerExperience();
            _playerPosition = memento.GetPlayerPosition();
            _inventory = memento.GetInventory();
            _completedQuests = memento.GetCompletedQuests();
            _activeQuests = memento.GetActiveQuests();
            _checkpointId = memento.GetCheckpointId();
            _startTime = DateTime.UtcNow - memento.GetPlayTime();

            Console.WriteLine($"[GAME] Game loaded: {memento.SaveName}");
        }

        public void PrintStatus()
        {
            Console.WriteLine("\n=== Game Status ===");
            Console.WriteLine($"Level: {_playerLevel} | Health: {_playerHealth}/100 | Mana: {_playerMana}/100");
            Console.WriteLine($"Experience: {_playerExperience}/{_playerLevel * 100}");
            Console.WriteLine($"Location: {_playerPosition}");
            Console.WriteLine($"Checkpoint: {_checkpointId}");

            if (_inventory.Count > 0)
            {
                Console.WriteLine($"Inventory: {string.Join(", ", _inventory.Select(kvp => $"{kvp.Key} x{kvp.Value}"))}");
            }
            else
            {
                Console.WriteLine("Inventory: Empty");
            }

            Console.WriteLine($"Active Quests: {string.Join(", ", _activeQuests)}");
            Console.WriteLine($"Completed Quests: {_completedQuests.Count}");
            Console.WriteLine();
        }
    }

    // Caretaker - Save game manager
    public class SaveGameManager
    {
        private readonly Dictionary<string, GameMemento> _saves;
        private readonly Stack<GameMemento> _autoSaves;
        private readonly int _maxAutoSaves;
        private readonly object _lockObject = new object();

        public SaveGameManager(int maxAutoSaves = 5)
        {
            _saves = new Dictionary<string, GameMemento>();
            _autoSaves = new Stack<GameMemento>();
            _maxAutoSaves = maxAutoSaves;
        }

        public void SaveGame(GameState game, string saveName)
        {
            if (game == null)
            {
                throw new ArgumentNullException(nameof(game));
            }
            if (string.IsNullOrWhiteSpace(saveName))
            {
                throw new ArgumentException("Save name cannot be empty", nameof(saveName));
            }

            GameMemento memento = game.CreateMemento(saveName);

            lock (_lockObject)
            {
                _saves[saveName] = memento;
            }

            Console.WriteLine($"[SAVE MANAGER] Saved game: {saveName} (ID: {memento.Id})");
        }

        public void AutoSave(GameState game)
        {
            if (game == null)
            {
                throw new ArgumentNullException(nameof(game));
            }

            GameMemento memento = game.CreateMemento($"AutoSave_{DateTime.UtcNow:yyyyMMdd_HHmmss}");

            lock (_lockObject)
            {
                _autoSaves.Push(memento);

                // Limit auto-save history
                while (_autoSaves.Count > _maxAutoSaves)
                {
                    GameMemento oldest = _autoSaves.ToArray().Last();
                    Stack<GameMemento> temp = new Stack<GameMemento>(_autoSaves.Reverse().Skip(1).Reverse());
                    _autoSaves.Clear();
                    foreach (GameMemento m in temp)
                    {
                        _autoSaves.Push(m);
                    }
                    Console.WriteLine($"[SAVE MANAGER] Removed oldest auto-save: {oldest.SaveName}");
                }
            }

            Console.WriteLine($"[SAVE MANAGER] Auto-saved game ({_autoSaves.Count}/{_maxAutoSaves})");
        }

        public void LoadGame(GameState game, string saveName)
        {
            if (game == null)
            {
                throw new ArgumentNullException(nameof(game));
            }

            GameMemento memento = null;

            lock (_lockObject)
            {
                if (!_saves.ContainsKey(saveName))
                {
                    throw new InvalidOperationException($"Save '{saveName}' not found");
                }
                memento = _saves[saveName];
            }

            game.RestoreFromMemento(memento);
            Console.WriteLine($"[SAVE MANAGER] Loaded game: {saveName}");
        }

        public void LoadAutoSave(GameState game, int index = 0)
        {
            if (game == null)
            {
                throw new ArgumentNullException(nameof(game));
            }

            GameMemento memento = null;

            lock (_lockObject)
            {
                if (_autoSaves.Count == 0)
                {
                    throw new InvalidOperationException("No auto-saves available");
                }

                GameMemento[] autoSaveArray = _autoSaves.ToArray();
                if (index < 0 || index >= autoSaveArray.Length)
                {
                    throw new ArgumentOutOfRangeException(nameof(index));
                }

                memento = autoSaveArray[index];
            }

            game.RestoreFromMemento(memento);
            Console.WriteLine($"[SAVE MANAGER] Loaded auto-save #{index + 1}");
        }

        public List<string> ListSaves()
        {
            lock (_lockObject)
            {
                return _saves.Values
                    .OrderByDescending(m => m.Timestamp)
                    .Select(m => m.GetSummary())
                    .ToList();
            }
        }

        public List<string> ListAutoSaves()
        {
            lock (_lockObject)
            {
                return _autoSaves
                    .Select((m, i) => $"#{i + 1}: {m.GetSummary()}")
                    .ToList();
            }
        }

        public void DeleteSave(string saveName)
        {
            lock (_lockObject)
            {
                if (_saves.Remove(saveName))
                {
                    Console.WriteLine($"[SAVE MANAGER] Deleted save: {saveName}");
                }
            }
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Memento Pattern - Game Save System ===\n");

            try
            {
                GameState game = new GameState();
                SaveGameManager saveManager = new SaveGameManager(maxAutoSaves: 3);

                // Initial state
                game.PrintStatus();

                // Play for a while
                Console.WriteLine("=== Playing Game - Chapter 1 ===\n");
                game.AddItem("Health Potion", 3);
                game.AddItem("Sword");
                game.MoveTo("Dark Forest");
                game.GainExperience(50);
                await Task.Delay(100);

                // Auto-save
                saveManager.AutoSave(game);
                game.PrintStatus();

                // Continue playing
                Console.WriteLine("=== Playing Game - Chapter 2 ===\n");
                game.TakeDamage(30);
                game.CompleteQuest("Find the Elder");
                game.StartQuest("Defeat the Dragon");
                game.ReachCheckpoint(1);
                await Task.Delay(100);

                // Manual save
                saveManager.SaveGame(game, "BeforeBoss");
                game.PrintStatus();

                // Boss fight
                Console.WriteLine("=== Boss Fight ===\n");
                game.MoveTo("Dragon's Lair");
                game.TakeDamage(50);
                game.UseMana(30);
                game.RemoveItem("Health Potion", 2);
                await Task.Delay(100);

                // Auto-save during fight
                saveManager.AutoSave(game);

                // Player wins and levels up
                game.GainExperience(150);
                game.CompleteQuest("Defeat the Dragon");
                game.AddItem("Dragon Scale", 5);
                game.AddItem("Legendary Sword");
                game.ReachCheckpoint(2);
                await Task.Delay(100);

                // Victory save
                saveManager.SaveGame(game, "VictorySave");
                game.PrintStatus();

                // List all saves
                Console.WriteLine("\n=== Saved Games ===");
                foreach (string save in saveManager.ListSaves())
                {
                    Console.WriteLine(save);
                }

                Console.WriteLine("\n=== Auto-Saves ===");
                foreach (string autoSave in saveManager.ListAutoSaves())
                {
                    Console.WriteLine(autoSave);
                }

                // Restore from earlier save
                Console.WriteLine("\n=== Loading 'BeforeBoss' Save ===\n");
                saveManager.LoadGame(game, "BeforeBoss");
                game.PrintStatus();

                // Try different path
                Console.WriteLine("=== Alternative Path ===\n");
                game.MoveTo("Ancient Temple");
                game.StartQuest("Find Sacred Artifact");
                game.AddItem("Magic Scroll", 2);
                await Task.Delay(100);

                saveManager.SaveGame(game, "AlternativePath");
                game.PrintStatus();

                // Restore from auto-save
                Console.WriteLine("=== Loading Most Recent Auto-Save ===\n");
                saveManager.LoadAutoSave(game, 0);
                game.PrintStatus();

                Console.WriteLine("=== Final Save List ===");
                foreach (string save in saveManager.ListSaves())
                {
                    Console.WriteLine(save);
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
