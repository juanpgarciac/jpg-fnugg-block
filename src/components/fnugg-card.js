class FnuggCard extends React.Component {
	constructor(props){
		super(props);
	}
	render(){
		return (<div className="jpg-fnugg-parent">
			<div className="jpgfnugg-container" style={{ backgroundImage: 'url('+this.props.attrs?.resortData?.image+')' }}>
		<div className="jpgfnugg-container__info">
		 <span><i className="fas fa-eye"></i>2350</span>
		 <span><i className="fas fa-comment-alt"></i>624</span>
		 <span><i className="fas fa-download"></i>1470</span>
		</div>
		<div className="jpgfnugg-container__profile">
		 <div className="jpgfnugg-container__profile__text">
		  <h2>{this.props.attrs?.resortData?.name}</h2>
		  <p><b>{this.props.attrs?.resortData?.region}</b></p>
		 </div>
		</div>
	   </div>
	   </div>)

	   {/*
	
	            <div>Region: {this.props.attrs?.resortData?.region}</div>
            <div>Sky: {this.props.attrs?.resortData?.sky}</div>            
            <div>Last updated: {this.props.attrs?.resortData?.last_updated}</div>            
            <div>Temp: {this.props.attrs?.resortData?.temperature?.value}</div>
            <div>Wind: {this.props.attrs?.resortData?.wind?.name}</div>
            <div>Condition: {this.props.attrs?.resortData?.condition}</div>
	
	*/}
	}
}

export default FnuggCard;