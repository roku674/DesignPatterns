# CLAUDE.md (DesignPatterns)

## What this is
Reference collection of Gang of Four patterns (plus Cloud, Concurrency, Enterprise, Integration,
Microservices groups) implemented in C# (.NET 8), Java, and JavaScript. Educational examples, no shipped service.
Layout: `<Language>/<Category>/<Pattern>/`, each pattern with its own README.

## Inputs
- Owner requests for new or fixed patterns. No `PROJECT_WORK.md` in this repo. Status tables live in `CSharp/README.md`,
  `Java/PATTERN_CATALOG.md`, `Javascript/README.md`.

## Process
```bash
cd CSharp/<Category>/<Pattern> && dotnet run      # each pattern has its own .csproj
cd Java/<Category>/<Pattern> && javac *.java && java Main
cd Javascript/<Category>/<Pattern> && node index.js
```
Prereqs per README: .NET SDK (8.0 for CSharp), JDK 11+, Node 14+. Keep the same pattern/folder names across all three languages.

## Outputs
- Nothing deploys. Work on `develop`; the only CI is `.github/workflows/copyright-check.yml`
  (monthly copyright header update, opens a PR). New source files need the copyright header.

## Verification
- `dotnet build` in the changed C# pattern folder, `javac` for Java, `node` for JS; confirm the demo runs.
- No repo-wide test suite. Unknown, verify before assuming otherwise.

## Read only when needed
| Doing X | Read |
|---|---|
| Pattern list, learning path | `README.md` |
| C# status and structure | `CSharp/README.md`, `CSharp/Creational/IMPLEMENTATION_SUMMARY.md` |
| Java catalog | `Java/PATTERN_CATALOG.md`, `Java/README.md` |
| JavaScript layout | `Javascript/README.md` |
| SEO guidance (generic, 41KB) | `SEO.md` (grep the table of contents) |

## Landmines
- README status tables can lag the code (e.g. C# Structural shows partial); check folders before claiming completeness.
- Java/JS pattern READMEs may differ from C# ones; keep behavior parity when editing one language.
- Never use em/en dashes. No AI attribution in commits.
