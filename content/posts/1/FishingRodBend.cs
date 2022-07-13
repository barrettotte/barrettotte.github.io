using UnityEngine;
using System.Collections;

public class FishingRodBend : MonoBehaviour {

	private Transform[] bendyInterpolationPoints;
	private Transform[] rigidInterpolationPoints;
	private Transform[] deflectedPoints;

	public Transform deflectedParent;
	public Transform rigidPointParent;
	public Transform bendyPointParent;

	public GameObject pointPrefab;
	public Material redMat;
	public Material greenMat;
	public Material purpleMat;

	private float rodLength;
	private int interpolationAmount;
	private float interpolationRatio;

	private void Start() {
		rodLength = 12.0f;
		interpolationAmount = 16;
		interpolationRatio = rodLength / interpolationAmount;
		bendyInterpolationPoints = new Transform[interpolationAmount];
		rigidInterpolationPoints = new Transform[interpolationAmount];
		deflectedPoints = new Transform[interpolationAmount];

		CreatePoints (bendyInterpolationPoints, greenMat, bendyPointParent);
		CreatePoints (rigidInterpolationPoints, redMat, rigidPointParent);
		CreatePoints (deflectedPoints, purpleMat, deflectedParent);
	}

	private void FixedUpdate() {
		// Interpolate the points for the deflection
		for(int i = 0; i < interpolationAmount; i++){
			Vector3 a = rigidInterpolationPoints [i].position;
			Vector3 b = bendyInterpolationPoints [i].position;
			deflectedPoints [i].position = a + (b - a) * Deflection((i * interpolationRatio) + interpolationRatio);
		}
	}

	//	Euler-Bernoull : Beam Theory -> Cantilever beam with end load, derived formula
	private float Deflection(float x){
		return ((x * x) * (3 * rodLength - x) ) / (2 * (rodLength * rodLength * rodLength));
	}

	/* Helper method, used to create three sets of points for calculation */
	private void CreatePoints(Transform[] points, Material m, Transform parent){
		for(int i = 0; i < interpolationAmount; i++) {
			float currentZ = i * interpolationRatio;
			GameObject tmp = (GameObject)Instantiate (pointPrefab);
			tmp.transform.SetParent (parent);
			tmp.transform.name = "Point (" + (i+1) + ")";
			tmp.transform.localPosition = new Vector3 (0, 0.0f, currentZ);
			tmp.transform.localScale = new Vector3 (0.25f, 0.25f, 0.25f);
			tmp.gameObject.GetComponent<Renderer> ().sharedMaterial = m;
			points [i] = tmp.transform;
		}
	}

}
