const t = require('./types')
const { Maze } = require('./maze')

const locationToKey = location => location.join(',')

/**
 * @param {{
 *  maze: Maze
 *  startLocation: t.Location
 * }} params
 * @returns {{
 *  location: string
 *  distance: number
 *  jumps: number
 *  path: t.Location[]
 * }[]}
 */
exports.solve = ({ maze, startLocation }) => {
    /**
     * @typedef {t.Node & {
     *  neighbors: t.Node[]
     *  path: t.Location[]
     * }} SearchNode
     *
     * @type {SearchNode[]}
     */
    const path = []

    const exploredLocations = new Set()

    path.push({
        ...maze.node(startLocation),
        neighbors: maze.getNeighbors(startLocation),
    })
    exploredLocations.add(locationToKey(startLocation))

    let distance = 0
    let jumps = 0

    while (true) {
        const currentNode = path.at(-1)

        if (currentNode.isExit) {
            return [
                {
                    location: locationToKey(currentNode.location),
                    distance,
                    jumps,
                    path: path.map(node => node.location),
                },
            ]
        }

        const neighbors = currentNode.neighbors.filter(
            neighbor => !exploredLocations.has(locationToKey(neighbor.location))
        )

        if (neighbors.length === 0) {
            path.pop()
            if (path.length === 0) {
                break
            }
            continue
        }

        const nextNode = neighbors.reduce((prev, curr) => {
            if (prev.weight > curr.weight) {
                return curr
            }
            return prev
        }, neighbors[0])

        path.push({
            ...nextNode,
            neighbors: maze.getNeighbors(nextNode.location),
        })
        exploredLocations.add(locationToKey(nextNode.location))
        distance += nextNode.weight
        jumps += 1
    }

    return []
}
