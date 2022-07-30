import * as THREE from "three";
import { describe, it, expect} from 'vitest'

describe('The THREE object', function() {

    it('should be able to construct a Vector3 with default of x=0', () => {
        const vec3 = new THREE.Vector3();
        expect(vec3.x).toStrictEqual(0);
    })
})