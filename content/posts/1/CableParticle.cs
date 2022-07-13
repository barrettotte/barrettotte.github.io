using System.Collections;

public class CableParticle{

	private Vector3 _position, _oldPosition;
	private Transform _boundTo = null;
	private Rigidbody _boundRigid = null;


	public Vector3 Position {
		get { return _position; }
		set { _position = value; }
	}

	public Vector3 Velocity {
		get { return (_position - _oldPosition); }
	}

	public CableParticle(Vector3 newPosition){
		_oldPosition = _position = newPosition;
	}

	public void UpdateVerlet(Vector3 gravityDisplacement){
		if (this.IsBound()){
			if (_boundRigid == null) {
				this.UpdatePosition(_boundTo.position);		
			} else{
				switch (_boundRigid.interpolation) {
					case RigidbodyInterpolation.Interpolate:
						this.UpdatePosition(_boundRigid.position + (_boundRigid.velocity * Time.fixedDeltaTime) / 2);
						break;
					case RigidbodyInterpolation.None:
					default:
						this.UpdatePosition(_boundRigid.position + _boundRigid.velocity * Time.fixedDeltaTime);
					break;
				}
			}
		} else {
			Vector3 newPosition = this.Position + this.Velocity + gravityDisplacement;
			this.UpdatePosition(newPosition);
		}
	}

	public void UpdatePosition(Vector3 newPos) {
		_oldPosition = _position;
		_position = newPos;
	}

	public void Bind(Transform to){
		_boundTo = to;
		_boundRigid = to.GetComponent<Rigidbody>();
		_oldPosition = _position = _boundTo.position;
	}

	public void UnBind(){
		_boundTo = null;
		_boundRigid = null;
	}

	public bool IsFree(){
		return (_boundTo == null);
	}

	public bool IsBound(){
		return (_boundTo != null);
	}

}