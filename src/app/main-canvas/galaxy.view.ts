import { Galaxy } from '../models/galaxy.model'

declare const THREE: any

export class GalaxyView {
    private raycaster = new THREE.Raycaster()

    constructor(private scene: THREE.Scene,
                private camera: THREE.Camera,
                private galaxy: Galaxy) {
        this.draw()
    }

    public onDblClick(event: MouseEvent): ExtendedMesh {
        const vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5)
        this.raycaster.setFromCamera(vector, this.camera) // http://stackoverflow.com/a/29373404/1747491

        const intersects = this.raycaster.intersectObjects(this.scene.children)

        if (intersects.length > 0) {
            const intersectedMesh: ExtendedMesh = intersects[0].object

            // compute the position of the new camera location
            const A = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z)
            const B = new THREE.Vector3(intersectedMesh.position.x, intersectedMesh.position.y, intersectedMesh.position.z)
            const AB = new THREE.Vector3((B.x - A.x), (B.y - A.y), (B.z - A.z))
            AB.normalize()

            return intersectedMesh
        } else {
            return null
        }
    }

    protected draw() {
        let geometry
        let material
        let mesh

        // Clear the previous scene
        this.clear()

        // Position the camera
        this.camera.position.set(0, 1000, 2000)

        // Add lighting
        const pointLight = new THREE.PointLight(0xFFFFFF)
        pointLight.position.set(0, 0, 0)
        this.scene.add(new THREE.PointLight(0xFFFFFF))
        // this.scene.add(new THREE.AmbientLight(0x555555))

        // Draw the sun
        geometry = new THREE.SphereGeometry(100, 10, 10)
        material = new THREE.MeshBasicMaterial({color: 0xFFCC33, wireframe: true})
        mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(0, 0, 0)
        this.scene.add(mesh)

        // Draw the planets
        for (const planet of this.system.planets) {

            // Planet
            geometry = new THREE.SphereGeometry(planet.radius, 10, 10)
            material = new THREE.MeshBasicMaterial({color: 0x66FF00, wireframe: true})
            mesh = new ExtendedMesh(geometry, material, planet)
            mesh.position.set(planet.coords.x, planet.coords.y, planet.coords.z)
            this.scene.add(mesh)

            // Planet's orbit
            this.scene.add(this.getOrbitLine(planet.distanceFromSun, null))

            for (const moon of planet.moons) {

                // Moon
                geometry = new THREE.SphereGeometry(moon.radius, 10, 10)
                material = new THREE.MeshBasicMaterial({color: 0xA9A9A9, wireframe: true})
                mesh = new ExtendedMesh(geometry, material, moon)
                mesh.position.set(moon.coords.x, moon.coords.y, moon.coords.z)
                this.scene.add(mesh)

                // Moon's orbit
                this.scene.add(this.getOrbitLine(moon.distanceFromPlanet, planet.coords))
            }
        }
    }

    private getOrbitLine(distanceFromCenter: number, centerPosition: Coords) {
        const geometry = new THREE.Geometry()
        const material = new THREE.LineBasicMaterial({color: 0xFFFFFF, opacity: 0.8})
        const resolution = 100
        const size = 360 / resolution
        let segment = null
        for (let i = 0; i <= resolution; i++) {
            segment = (i * size) * Math.PI / 180
            geometry.vertices.push(new THREE.Vector3(Math.cos(segment) * distanceFromCenter,
                0,
                Math.sin(segment) * distanceFromCenter))
        }

        const line = new THREE.Line(geometry, material)

        if (centerPosition) {
            line.translateX(centerPosition.x)
            line.translateY(centerPosition.y)
            line.translateZ(centerPosition.z)
        }

        return line
    }

    private clear() {
        for (const child of this.scene.children) {
            this.scene.remove(child)
        }
    }
}
