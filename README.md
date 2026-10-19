# Interactive 8-Puzzle Solver

## Project Description
A browser-based 8-Puzzle application. Users can enter an initial state and a goal state, generate a random solvable puzzle, and inspect how Uniform Cost Search (UCS) explores states to find a minimum-cost solution.

## Technologies Used
- React
- JavaScript (ES6+)
- Vite
- CSS
- Lucide React icons

## Search Algorithms Implemented
- **Uniform Cost Search (UCS) only.**
- No other search algorithms are implemented or offered in the interface.

## Heuristics Used
- **None.** UCS orders states by accumulated path cost `g(n)` and does not use a heuristic function.

## Screenshots
Screenshots will be added after the application is run and the final interface screenshots are provided.

Suggested screenshots:
- Homepage
- Puzzle input and solver workspace
- Search-process visualization
- Completed solution and Solution Summary

## GitHub Pages URL
Add the published URL here after deployment:

`https://YOUR-USERNAME.github.io/AI-8Puzzle-Visualizer-React-24BDS0409/`

Replace `YOUR-USERNAME` with the GitHub username used to publish the repository. If the repository name changes, update the `base` path in `vite.config.js`.

## Student Details
Student information is displayed on the application homepage.

## References
- React documentation: https://react.dev/
- Vite documentation: https://vite.dev/
- Course-provided 8-Puzzle assignment specification.

## How to Run the Project

### Requirements
Install a current LTS version of Node.js, which includes npm.

### Run locally
1. Extract the ZIP file.
2. Open a terminal in the extracted project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite in your browser.

### Create a production build
Run:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Algorithm Overview
Uniform Cost Search uses a priority queue and expands the frontier state with the lowest accumulated path cost first. Each legal tile move in this application costs 1, so the solution path cost equals the number of moves. UCS records parent states to reconstruct the solution path and tracks search statistics such as generated nodes, expanded nodes, execution time, and approximate memory use.

The displayed memory value is an estimate rather than a direct measurement of browser heap usage. Performance measurements may vary by device and browser.
