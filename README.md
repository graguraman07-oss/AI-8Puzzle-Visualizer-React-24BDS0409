# Interactive 8-Puzzle Problem Solver

An interactive 8-Puzzle application that demonstrates **Uniform Cost Search (UCS)**. Configure the initial and goal states, generate a random solvable puzzle, run the search, and inspect the solution path and search statistics.

## Live Website

**[Open the 8-Puzzle Solver](https://graguraman07-oss.github.io/AI-8Puzzle-Visualizer-React-24BDS0409/)**

## Student Details

| Field | Details |
|---|---|
| Course | Artificial Intelligence |
| Assignment Title | Interactive 8-Puzzle Problem Solver |
| Student Name | Raguraman Govindasamy |
| Registration Number | 24BDS0409 |

## Project Description

The 8-Puzzle consists of eight numbered tiles and one blank space arranged on a 3 × 3 board. The goal is to transform an initial arrangement into a specified goal arrangement by sliding a neighboring tile into the blank space.

This application visualizes how Uniform Cost Search explores puzzle states. Each legal move has a cost of 1, so the path cost is equal to the number of moves. UCS expands the frontier state with the lowest accumulated path cost and can find an optimal solution when implemented with correct path-cost ordering and state handling.

## Features

- Enter an initial state and a goal state.
- Load the provided example puzzle.
- Generate a random solvable puzzle.
- View the current puzzle state and highlighted tile changes.
- Run Uniform Cost Search and inspect the resulting solution path.
- Step through the search and control playback using Run, Pause, Resume, Next Step, Previous Step, and Reset.
- Adjust the playback speed.
- Inspect the node being expanded, parent node, frontier (open list), and explored (closed list).
- View statistics such as nodes generated, nodes expanded, search depth, maximum search depth, execution time, path cost, and approximate memory usage.
- Review a dedicated solution summary after the search finishes.

## Technology Stack

- **React** — Component-based user interface.
- **JavaScript** — Application logic and Uniform Cost Search implementation.
- **Vite** — Development server and production build tool.
- **CSS** — Layout, styling, and visual feedback.
- **Git and GitHub** — Version control and source hosting.
- **GitHub Actions and GitHub Pages** — Automated deployment and hosting.

## Algorithm: Uniform Cost Search (UCS)

Uniform Cost Search is an uninformed search algorithm that expands the state with the lowest accumulated path cost, `g(n)`.

### How it works

1. Add the initial state to the frontier with path cost 0.
2. Select the frontier state with the lowest path cost.
3. Check whether that state matches the goal state.
4. If it is not the goal, generate valid successor states by moving an adjacent tile into the blank space.
5. Track parent states and path costs, handling repeated states so that cheaper paths are retained.
6. Continue until the goal is found or the frontier becomes empty.
7. Reconstruct the solution path from the recorded parent states.

### Cost function

Every legal tile move costs 1:

`g(n) = number of moves from the initial state`

The frontier is ordered by accumulated path cost. UCS does not use a heuristic function.

### Properties

- **Completeness:** Complete for a finite state space when step costs are positive and bounded away from zero.
- **Optimality:** Finds a minimum-cost solution when implemented with correct path-cost ordering and state handling.
- **Time complexity:** Exponential in the general case. A common bound is `O(b^(1 + floor(C*/epsilon)))`, where `b` is the branching factor, `C*` is the optimal solution cost, and `epsilon` is the minimum positive step cost.
- **Space complexity:** Exponential in the worst case because frontier and explored states must be stored.

## Screenshots

The following image paths are placeholders. Save the screenshots you sent in a folder named `screenshots` in the project root, using the filenames below, and the images will display on GitHub.

### 1. Home page

<img width="1365" height="724" alt="Screenshot 2026-10-23 215042" src="https://github.com/user-attachments/assets/affe9340-b1c4-455d-924a-1b896509fbb1" />

### 2. Puzzle workspace and initial state

<img width="1365" height="578" alt="Screenshot 2026-10-23 215113" src="https://github.com/user-attachments/assets/d495e19b-afed-4032-973d-cd6319e0b214" />
<img width="1365" height="586" alt="Screenshot 2026-10-23 215134" src="https://github.com/user-attachments/assets/27a68aa1-4ae6-44f1-9eb7-4e817c243c11" />


### 3. Search process and UCS information

<img width="1365" height="649" alt="Screenshot 2026-10-23 215145" src="https://github.com/user-attachments/assets/e3f00731-b814-4a62-b81d-d146278485bf" />


### 4. Puzzle during execution
<img width="1365" height="595" alt="Screenshot 2026-10-23 215718" src="https://github.com/user-attachments/assets/39a16e90-5559-4dc5-9f5f-8718b3c5b30e" />


### 5. Search lists and solution summary

<img width="1364" height="595" alt="Screenshot 2026-10-23 215745" src="https://github.com/user-attachments/assets/37100b8a-434e-47ff-9623-ce3850e49724" />

## Run Locally

### Prerequisites

Install [Node.js](https://nodejs.org/) and Git.

### 1. Clone the repository

```bash
git clone https://github.com/graguraman07-oss/AI-8Puzzle-Visualizer-React-24BDS0409.git
```

### 2. Enter the project folder

```bash
cd AI-8Puzzle-Visualizer-React-24BDS0409
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed in the terminal (Vite commonly uses `http://localhost:5173/`).

### 5. Create a production build

```bash
npm run build
```

Vite writes the production files to the `dist` directory.

## Deployment

The website is hosted on GitHub Pages. GitHub Actions builds the Vite application and deploys the generated site.

**Live URL:** https://graguraman07-oss.github.io/AI-8Puzzle-Visualizer-React-24BDS0409/

## References

1. Russell, Stuart J., and Peter Norvig. *Artificial Intelligence: A Modern Approach*. Pearson.
2. [React documentation](https://react.dev/)
3. [Vite documentation](https://vite.dev/guide/)
4. [GitHub Pages documentation](https://docs.github.com/en/pages)
5. [GitHub Actions documentation](https://docs.github.com/en/actions)

---

**Student:** Raguraman Govindasamy  
**Registration Number:** 24BDS0409
