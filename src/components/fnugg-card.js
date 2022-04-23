class FnuggCard extends React.Component {
	constructor(props){
		super(props);
	}
	render(){
		return (<div>
			<h3>{this.props.attrs?.resortData?.name}</h3>
            <img src={this.props.attrs?.resortData?.image} />
            <div>Region: {this.props.attrs?.resortData?.region}</div>
            <div>Sky: {this.props.attrs?.resortData?.sky}</div>            
            <div>Last updated: {this.props.attrs?.resortData?.last_updated}</div>            
            <div>Temp: {this.props.attrs?.resortData?.temperature?.value}</div>
            <div>Wind: {this.props.attrs?.resortData?.wind?.name}</div>
            <div>Condition: {this.props.attrs?.resortData?.condition}</div>
		</div>)
	}
}

export default FnuggCard;