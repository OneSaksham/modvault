# Contributing to ModVault

Thank you for your interest in contributing to ModVault. We welcome contributions from developers and gamers to improve Minecraft modding for everyone.

---

## Code of Conduct

- Be respectful and constructive in all discussions, pull requests, and issues.
- Prioritize user safety, code clarity, and strict zero-telemetry standards.

---

## Development Workflow

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/<your-username>/ModVault.git
   cd ModVault
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Verify Compilation**:
   Before submitting changes, run:
   ```bash
   npm run build
   ```

6. **Submit a Pull Request**:
   Push your branch and open a PR against the `main` branch with a clear summary of your changes.

---

## Guidelines

- **Architecture Integrity**: Keep launcher detection non-blocking and avoid hardcoded filesystem assumptions.
- **Safety First**: ModVault must never modify world save data (`saves/`) or delete user jars without explicit user confirmation (use `.jar.disabled` toggle instead).
- **Aesthetics**: Maintain the Golden Ratio (`phi = 1.618`) design system with Dark Obsidian and Cyber Emerald accents.

