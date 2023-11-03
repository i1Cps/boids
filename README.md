<!-- ⚠️ This README has been generated from the file(s) "blueprint.md" ⚠️--><h1 align="center">Boids</h1>
<p align="center">
  <img src="images/boids.png" alt="Logo" width="550" height="auto" />
</p>


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#table-of-contents)

## ➤ Table of Contents

* [➤ :pencil: About The Project](#-pencil-about-the-project)
* [➤ ➤ :rocket: Dependencies](#--rocket-dependencies)
* [➤ :coffee: Buy me a coffee](#-coffee-buy-me-a-coffee)
* [➤ :scroll: Credits](#-scroll-credits)


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#pencil-about-the-project)

## ➤ :pencil: About The Project
[Boids](https://boids.theo-moore-calters.online) is an interactive 3D-rendered flock simulation inspired by the pioneering work of [Craig Reynolds](https://www.red3d.com/cwr/index.html) in his 1987 [paper](https://www.red3d.com/cwr/boids/). This project brings to life the fascinating dynamics of flock behaviour with over 1000 individual Boids that closely follow the principles outlined in Reynolds' paper. The heart of this simulation lies in implementing three crucial rules: Alignment, Separation, and Cohesion.

Alignment: Each Boid in the simulation attempts to align its velocity with its neighbouring Boids. This rule creates the illusion of birds flying in the same general direction, maintaining a sense of unity within the flock.

Separation: Boids actively avoid colliding with their peers by calculating the direction towards other Boids and applying the opposite direction to their velocity. This behaviour results in the characteristic avoidance of collisions. It is fundamental in creating the appearance of individual Boids manoeuvring within the flock.

Cohesion: To mimic the natural tendency of birds sticking together, Boids are drawn towards the average position of their nearby companions. This cohesion rule ensures the flock remains relatively tightly knit and exhibits the graceful and cohesive movement observed in real-life bird flocks.

To enhance the performance of this simulation, I use a quad-tree data structure. Quad-trees facilitate efficient spatial partitioning of the Boids within the 3D world by recursively dividing the simulation space into smaller quadrants, with each quadrant containing a subset of Boids. This partitioning significantly improves the computational efficiency of the simulation, allowing it to run smoothly even when dealing with a large number of Boids. It helps each Boid effectively search for nearby Boids and apply the three principles in O(nlogn) time, contributing to the overall realism and smoothness of the flocking behaviour.

You can experience this mesmerizing 3D flock simulation at [boids.theo-moore-calters.online](https://boids.theo-moore-calters.online). It beautifully captures the essence of bird-like flocking behaviour, demonstrating the elegance and simplicity of the principles put forth by Craig Reynolds in his iconic Boids paper.

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#-rocket-dependencies)

## ➤ ➤ :rocket: Dependencies

The A* search algorithm is implemented in TypeScript to handle the logic behind maze solving. For the visual representation of maze generation and solving, this project leverages the Three.js library. To provide a user-friendly interface and deploy the application as a web-based tool, it's encapsulated within a React application.
  
![React Badge](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000&style=for-the-badge) ![Three.js Badge](https://img.shields.io/badge/Three.js-000?logo=threedotjs&logoColor=fff&style=for-the-badge)
 ![TypeScript Badge](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=for-the-badge) ![Tailwind CSS Badge](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=fff&style=for-the-badge) 
{{ load:readme/project_files_description.md }}

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#coffee-buy-me-a-coffee)

## ➤ :coffee: Buy me a coffee
Whether you use this project, have learned something from it, or just like it, please consider supporting it by buying me a coffee, so I can dedicate more time on open-source projects like this (҂⌣̀_⌣́)

<a href="https://www.buymeacoffee.com/i1Cps" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#scroll-credits)

## ➤ :scroll: Credits

Theo Moore-Calters 


[![GitHub Badge](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/i1Cps) [![LinkedIn Badge](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](www.linkedin.com/in/theo-moore-calters)

{{ template:license }}