import { System } from '../../models/system.model'

declare const THREE: any
declare const TWEEN: any

export class SystemView {
    private static focusDistance = 150
    private raycaster = new THREE.Raycaster()

    constructor(private scene,
                private camera,
                private controls,
                private system: System) {
        this.setup()
    }

    public handleDblClick(event) {
        const vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5)
        this.raycaster.setFromCamera(vector, this.camera)

        const intersects = this.raycaster.intersectObjects(this.scene.children)
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object

            // compute the position of the new camera location
            const A = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z)
            const B = new THREE.Vector3(intersectedObject.position.x, intersectedObject.position.y, intersectedObject.position.z)
            const AB = new THREE.Vector3((B.x - A.x), (B.y - A.y), (B.z - A.z))
            AB.normalize()


            new TWEEN.Tween(this.controls.target).to({
                x: intersectedObject.position.x,
                y: intersectedObject.position.y,
                z: intersectedObject.position.z
            }, 500).start()
        }
    }

    private clear() {
        for (let child of this.scene.children) {
            this.scene.remove(child)
        }
    }

    private setup() {
        let geometry
        let material
        let mesh

        // Clear the previous scene
        this.clear()

        // Position the camera
        this.camera.position.set(0, 0, 2000)

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
        for (let planet of this.system.planets) {

            // Planet
            geometry = new THREE.SphereGeometry(planet.radius, 10, 10)
            material = new THREE.MeshBasicMaterial({color: 0x66FF00, wireframe: true})
            mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(planet.coords.x, planet.coords.y, planet.coords.z)
            this.scene.add(mesh)

            // Planet's orbit
            geometry = new THREE.Geometry()
            material = new THREE.LineBasicMaterial({color: 0xFFFFFF, opacity: 0.8})
            let resolution = 100
            let size = 360 / resolution
            let segment = null
            for (let i = 0; i <= resolution; i++) {
                segment = (i * size) * Math.PI / 180
                geometry.vertices.push(new THREE.Vector3(Math.cos(segment) * planet.distanceFromSun, 0, Math.sin(segment) * planet.distanceFromSun))
            }
            let line = new THREE.Line(geometry, material)
            this.scene.add(line)
        }
    }
}
