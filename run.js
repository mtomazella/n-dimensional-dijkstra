const fs = require('fs')
const path = require('path')
const { Maze } = require('./maze')
const { solve } = require('.')

const importMaze = file => {
    const fileContent = fs
        .readFileSync(path.resolve(__dirname, file), 'utf-8')
        .split(',')
        .map(line => line.trim())
    const dimensions = Number(fileContent[0])
    const proportions = fileContent.slice(1, dimensions + 1).map(Number)

    return new Maze({
        dimensions,
        proportions,
        data: fileContent[dimensions + 1],
        weights: fileContent[dimensions + 2],
    })
}

const file = process.argv[2]
const startLocation = process.argv[3].split(',').map(Number)

if (!file) {
    console.error('Please provide a file name')
    process.exit(1)
}

console.time('Tempo total')
console.time('Importação')

let maze
try {
    maze = importMaze(file)
} catch (error) {
    console.error('Error importing maze:', error)
    process.exit(1)
}

console.timeEnd('Importação')

try {
    console.time('Solução')

    const solutions = solve({
        maze,
        startLocation,
    })

    console.timeEnd('Solução')
    console.timeEnd('Tempo total')
    console.log()

    console.log(maze.toString({ startLocation }))

    // console.log(
    //     JSON.stringify(
    //         solutions.map(s => ({ ...s, path: s.path.map(l => l.join(',')) })),
    //         null,
    //         2
    //     )
    // )

    for (let i = solutions.length - 1; i >= 0; i--) {
        const { path, distance } = solutions[i]
        console.log(`Saída ${i + 1}, score ${distance}:`)
        console.log(maze.toString({ startLocation, path }))
    }

    console.log(
        `${solutions.length} saída${
            solutions.length === 1 ? '' : 's'
        } encontrada${solutions.length === 1 ? '' : 's'}.`
    )
    if (solutions.length === 0) {
        console.log('Nenhuma saída encontrada.')
    } else if (solutions.length === 1) {
        console.log(`Saída tem score ${solutions[0].distance}.`)
    } else {
        console.log(
            `Score varia de ${solutions[0].distance} a ${
                solutions.at(-1).distance
            }.`
        )
    }
} catch (error) {
    console.error('Error running maze:', error)
    process.exit(1)
}

/*

// 1D
possible.mz 1
1 saída encontrada.
Saída tem score 17.

impossible.mz 1
Nenhuma saída encontrada.

// 2D
5.mz 7,7
2 saídas encontradas.
Score varia de 25 a 53.

50.mz 5,5
2 saídas encontradas.
Score varia de 253 a 433.

// 3D
1.mz 0,0,0
1 saída encontrada.
Saída tem score 28.

10.mz 7,5,0
2 saídas encontradas.
Score varia de 39 a 119.

10.mz 5,5,4
2 saídas encontradas.
Score varia de 21 a 89.

// 4D
5.mz 0,0,0,0
2 saídas encontradas.
Score varia de 8 a 9.

*/
