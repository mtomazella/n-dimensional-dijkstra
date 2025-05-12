const t = require('./types')

const tiles = {
    empty: '_',
    wall: 'w',
    exit: 'e',
}

class Maze {
    constructor({ dimensions, proportions, data: rawData = '' }) {
        this.dimensions = dimensions
        this.proportions = proportions

        rawData = rawData.replaceAll('-1', tiles.exit)
        rawData = rawData.replaceAll('1', tiles.wall)
        rawData = rawData.replaceAll('0', tiles.empty)
        rawData = rawData.replaceAll(' ', '')
        rawData = rawData.replaceAll('\n', '')

        if (rawData.length !== proportions.reduce((sum, p) => sum * p, 1)) {
            throw new Error('Invalid data length')
        }
        if (
            rawData.split('').filter(c => Object.values(tiles).includes(c))
                .length !== rawData.length
        ) {
            throw new Error('Invalid data characters')
        }

        this.rawData = rawData.split('')

        const buildMultiDimMatrix = (data, dimensions) => {
            let dataIndex = 0

            const build = (dimensions, position = []) => {
                const size = dimensions[0]
                if (dimensions.length === 1) {
                    return Array.from({ length: size }, (value, key) => {
                        const tile = data[dataIndex++]
                        return {
                            location: [key, ...position],
                            tile,
                            weight: 1,
                            isWall: tile === tiles.wall,
                            isExit: tile === tiles.exit,
                        }
                    })
                } else {
                    return Array.from({ length: size }, (value, key) =>
                        build(dimensions.slice(1), [key, ...position])
                    )
                }
            }

            return build(dimensions)
        }

        this.data = buildMultiDimMatrix(
            this.rawData,
            [...this.proportions].reverse()
        )

        console.log()
    }

    /**
     * @param {t.Location} location
     * @return {t.Node}
     */
    node(location, data = this.data) {
        let node = data

        for (let d = this.dimensions - 1; d >= 0; d--) {
            const index = location[d]

            if (index < 0 || index >= this.proportions[d]) {
                throw new Error(`Invalid ${d} coordinate`)
            }

            node = node[index]
        }

        return node
    }

    /**
     * @param {t.Location} location
     * @returns {t.Node[]}
     */
    getNeighbors(location) {
        const neighbors = []

        for (let d = 0; d < this.dimensions; d++) {
            if (location[d] > 0) {
                const neighbor = [...location]
                neighbor[d] -= 1
                neighbors.push(neighbor)
            }
            if (location[d] < this.proportions[d] - 1) {
                const neighbor = [...location]
                neighbor[d] += 1
                neighbors.push(neighbor)
            }
        }

        return neighbors
            .map(neighbor => this.node.bind(this)(neighbor))
            .filter(({ isWall }) => !isWall)
    }

    toString({ startLocation, path } = {}) {
        this.tileMap = {
            [tiles.empty]: ' ',
            [tiles.wall]: '#',
            [tiles.exit]: '*',
            s: '🯅',
        }

        const data = JSON.parse(JSON.stringify(this.data))

        if (path) {
            for (let i = 0; i < path.length; i++) {
                const location = path[i]
                const node = this.node(location, data)
                if (node.tile !== tiles.exit) {
                    node.tile = i.toString().split('').at(-1)
                }
            }
        }

        if (startLocation) {
            for (let d = 0; d < this.dimensions; d++) {
                if (
                    startLocation[d] < 0 ||
                    startLocation[d] >= this.proportions[d]
                ) {
                    throw new Error(`Invalid ${d} coordinate`)
                }
            }

            this.node(startLocation, data).tile = 's'
        }

        let mazeString = ''

        const flatten = item => {
            if (Array.isArray(item)) {
                for (const subItem of item) {
                    flatten(subItem)
                }
                mazeString += '\n'
            } else {
                mazeString += this.tileMap[item.tile] ?? item.tile
            }
        }

        flatten(data)

        return mazeString
    }
}

module.exports = {
    Maze,
    tiles,
}
