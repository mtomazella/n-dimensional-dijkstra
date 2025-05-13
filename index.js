const { Maze } = require('./maze')
const t = require('./types')

const locationToKey = location => location.join(',')

/**
 * @param {{
 *   maze: Maze
 *   startLocation: t.Location
 * }} params
 * @return {{
 *  location: string
 *  distance: number
 *  path: t.Location[]
 * }[]}
 */
exports.solve = ({ maze, startLocation }) => {
    /**
     * @typedef {t.Node & {
     *  distance: number,
     *  jumps: number,
     *  completelyExplored: boolean,
     *  neighbors: t.Node[]
     *  path: t.Location[]
     * }} SearchNode
     *
     * @type {Record<string, SearchNode>}
     */
    const map = {}

    map[locationToKey(startLocation)] = {
        ...maze.node(startLocation),
        distance: 0,
        jumps: 0,
        completelyExplored: false,
        neighbors: maze.getNeighbors(startLocation),
        path: [],
    }

    if (map[locationToKey(startLocation)].isExit) {
        return {
            exits: [map[locationToKey(startLocation)]],
            path: [startLocation],
        }
    }

    const getSearchQueue = () => {
        return Object.entries(map)
            .filter(([_, node]) => {
                return !node.completelyExplored
            })
            .sort((a, b) => {
                return a[1].distance - b[1].distance
            })
    }

    while (true) {
        const searchQueue = getSearchQueue()

        if (searchQueue.length === 0) {
            break
        }

        const [key, nodeToSearch] = searchQueue[0]
        const neighbors = nodeToSearch.neighbors

        for (const neighbor of neighbors) {
            const node = maze.node(neighbor.location)
            const searchNode = {
                ...node,
                distance: nodeToSearch.distance + node.weight,
                jumps: nodeToSearch.jumps + 1,
                completelyExplored: false,
                neighbors: maze.getNeighbors(neighbor.location),
                path: [...nodeToSearch.path, nodeToSearch.location],
            }
            const searchNodeKey = locationToKey(neighbor.location)

            if (map[searchNodeKey]) {
                if (map[searchNodeKey].distance > searchNode.distance) {
                    map[searchNodeKey] = searchNode
                }
            } else {
                map[searchNodeKey] = searchNode
            }
        }

        map[key].completelyExplored = true
    }

    const exits = Object.values(map)
        .filter(node => {
            return node.isExit
        })
        .map(node => {
            return {
                ...node,
                location: node.location.join(','),
                path: [...node.path, node.location],
            }
        })
        .sort((a, b) => {
            return a.distance - b.distance
        })

    return exits.map(node => {
        return {
            location: node.location,
            distance: node.distance,
            jumps: node.jumps,
            path: node.path,
        }
    })
}
