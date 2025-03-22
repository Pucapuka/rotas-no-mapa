const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Configuração do grafo
const graph = {
    A: { B: 90, G: 145 },
    B: { A: 90, C: 120, D: 60 },
    C: { B: 120, D: 130, E: 70 },
    D: { B: 60, C: 130, F: 95, G: 120, H: 120 },
    E: { C: 70, J: 150 },
    F: { D: 95, J: 125 },
    G: { A: 145, D: 120, H: 100 },
    H: { D: 120, G: 100, I: 90, J: 130 },
    I: { H: 90, J: 100 },
    J: { E: 150, F: 125, H: 130, I: 100 }
};

// Função para encontrar todas as rotas entre dois pontos
function findAllRoutes(graph, start, end, visited = new Set(), path = [], allRoutes = []) {
    visited.add(start);
    path.push(start);

    if (start === end) {
        allRoutes.push({ path: [...path], distance: calculateDistance(path) });
    } else {
        for (let neighbor in graph[start]) {
            if (!visited.has(neighbor)) {
                findAllRoutes(graph, neighbor, end, visited, path, allRoutes);
            }
        }
    }

    path.pop();
    visited.delete(start);

    return allRoutes;
}

// Função para calcular a distância de um caminho
function calculateDistance(path) {
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        distance += graph[path[i]][path[i + 1]];
    }
    return distance;
}

// Rota para servir a página HTML
app.use(express.static(path.join(__dirname, 'public')));

// Rota para calcular as distâncias
app.get('/calculate', (req, res) => {
    const start = req.query.start;
    const end = req.query.end;

    if (!graph[start] || !graph[end]) {
        return res.status(400).json({ error: 'Pontos inválidos' });
    }

    // Encontrar todas as rotas possíveis
    const allRoutes = findAllRoutes(graph, start, end);

    // Encontrar a menor rota
    const shortestRoute = allRoutes.reduce((min, route) => 
        route.distance < min.distance ? route : min
    );

    // Encontrar a maior rota
    const longestRoute = allRoutes.reduce((max, route) => 
        route.distance > max.distance ? route : max
    );

    res.json({
        start,
        end,
        shortestDistance: shortestRoute.distance,
        shortestPath: shortestRoute.path.join(' -> '),
        longestDistance: longestRoute.distance,
        longestPath: longestRoute.path.join(' -> ')
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});