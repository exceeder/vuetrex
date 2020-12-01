import * as THREE from "three";

describe('The THREE object', function() {

    it('should be able to construct a Vector3 with default of x=0', () => {
        const vec3 = new THREE.Vector3();
        expect(vec3.x).toStrictEqual(0);
    })
})