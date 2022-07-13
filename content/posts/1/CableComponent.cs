using UnityEngine;
using System;
using System.Collections;


public class CableComponent : MonoBehaviour{

	[SerializeField] private Transform endPoint;
	[SerializeField] private Material cableMaterial;

	[SerializeField] private float cableLength = 0.5f;
	[SerializeField] private int totalSegments = 5;
	[SerializeField] private float segmentsPerUnit = 2f;
	private int segments = 0;
	[SerializeField] private float cableWidth = 0.1f;

	[SerializeField] private int verletIterations = 1;
	[SerializeField] private int solverIterations = 1;
	[SerializeField] private float stiffness = 1f;
	private LineRenderer line;
	private CableParticle[] points;


	private void Start(){
		InitCableParticles();
		InitLineRenderer();
	}

	private void Update(){
		RenderCable();
	}

	private void FixedUpdate(){
		VerletIntegrate();
		SolveConstraints();
	}

	private void InitCableParticles(){
		if (totalSegments > 0){
			segments = totalSegments;
		} else {
			segments = Mathf.CeilToInt (cableLength * segmentsPerUnit);
		}
		Vector3 cableDirection = (endPoint.position - transform.position).normalized;
		float initialSegmentLength = cableLength / segments;
		points = new CableParticle[segments + 1];
		for (int i = 0; i <= segments; i++) {
			Vector3 initialPosition = transform.position + (cableDirection * (initialSegmentLength * i));
			points[i] = new CableParticle(initialPosition);
		}
		CableParticle start = points[0];
		CableParticle end = points[segments];
		start.Bind(this.transform);
		end.Bind(endPoint.transform);
	}

	private void InitLineRenderer(){
		line = this.gameObject.AddComponent<LineRenderer>();
		line.SetWidth(cableWidth, cableWidth);
		line.SetVertexCount(segments + 1);
		line.material = cableMaterial;
		line.GetComponent<Renderer>().enabled = true;
	}

	private void RenderCable(){
		for (int pointIdx = 0; pointIdx < segments + 1; pointIdx++) {
			line.SetPosition(pointIdx, points [pointIdx].Position);
		}
	}

	// Verlet integration pass -every particle updates its position and speed.
	private void VerletIntegrate(){
		Vector3 gravityDisplacement = Time.fixedDeltaTime * Time.fixedDeltaTime * Physics.gravity;
		foreach (CableParticle particle in points) {
			particle.UpdateVerlet(gravityDisplacement);
		}
	}

	private void SolveConstraints(){
		SolveDistanceConstraint();
		SolveStiffnessConstraint();
	}

	private void SolveDistanceConstraint(){
		float segmentLength = cableLength / segments;
		for (int i = 0; i < segments; i++) {
			CableParticle particleA = points[i];
			CableParticle particleB = points[i + 1];
			SolveDistanceConstraint(particleA, particleB, segmentLength);
		}
	}

	private void SolveDistanceConstraint(CableParticle particleA, CableParticle particleB, float segmentLength){
		Vector3 delta = particleB.Position - particleA.Position;
		float currentDistance = delta.magnitude;
		float errorFactor = (currentDistance - segmentLength) / currentDistance;

		// Only move free particles to satisfy constraints
		if (particleA.IsFree() && particleB.IsFree()) {
			particleA.Position += errorFactor * 0.5f * delta;
			particleB.Position -= errorFactor * 0.5f * delta;
		} else if (particleA.IsFree()) {
			particleA.Position += errorFactor * delta;
		} else if (particleB.IsFree()) {
			particleB.Position -= errorFactor * delta;
		}
	}

	private void SolveStiffnessConstraint(){
		float distance = (points[0].Position - points[segments].Position).magnitude;
		if (distance > cableLength) {
			foreach (CableParticle particle in points) {
				SolveStiffnessConstraint(particle, distance);
			}
		}	
	}

	/**
	 * TODO: I'll implement this constraint to reinforce cable stiffness 
	 * As the system has more particles, the verlet integration aproach 
	 * may get way too loose cable simulation. This constraint is intended to reinforce the cable stiffness.
	 * // throw new System.NotImplementedException ();
	**/
	void SolveStiffnessConstraint(CableParticle cableParticle, float distance){
	}

}