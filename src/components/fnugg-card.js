class FnuggCard extends React.Component {
	constructor(props){
		super(props);
		this.skyIcon = this.skyIcon.bind(this);
		this._r = this._rd.bind(this);
	}
	_rd(key){
		//get resort data with a key
		return (this.props.attrs?.resortData[key]) ?? null;
	}
	windDirection(d){
		//considering the arrow icon is poiting at north (90°) set arrow position with transform rotate css function
		let coordinates = {"N":0,"S":180,"E":90,"W":-90,"NE":45,"NW":-45,"SW":225,"SE":135}
		return 'rotate('+(coordinates[d] || 0)+'deg)'	
	}
	skyIcon(condition){
		//show sky condition icon
		let symbols  = {"Sun":"sun","PartlyCloud":"cloud","LightCloud":"cloud-sun","Cloud":"clouds","Rain":"raindrops","-":"exclamation"}
		return "fas fa-" + (symbols[condition])
	}
	render(){
		//if no info, just blank
		if(this.props.attrs.id == "") return (<div></div>)
		else return (
		<div className="jpg-fnugg-parent">
			<div className="jpgfnugg-container" style={{ backgroundImage: 'url('+this._rd('image')+')' }}>
				<div className="jpgfnugg-container__info">
					<span title={ 
						this.props.__('Temperature:','jpg-fnugg-block') +' '+ 
						this.props.__(this._rd('temperature')?.value ?? '-','jpg-fnugg-block')+'° '+
						this.props.__(this._rd('temperature')?.unit ?? '','jpg-fnugg-block') }> 
						 <i className="fas fa-thermometer-half"></i>{  this._rd('temperature')?.value+ '°'  }
					</span>
		 			<span title={ 
						 this.props.__('Sky condition:','jpg-fnugg-block') +' '+ 
						 this.props.__(this._rd('sky') ?? '-','jpg-fnugg-block') 
						 }>
						 <i className={ this.skyIcon(this._rd('sky') ?? '-') }></i>
						 <small>{ this.props.__(this._rd('sky') ?? '-','jpg-fnugg-block') }</small>
					</span>
		 			<span title={
						 this.props.__('Wind direction & speed:','jpg-fnugg-block') +' '+ 
						 this._rd('wind')?.name + ' | ' + 
						 this._rd('wind')?.mps+' m/s '+ 
						 this.props.__(this._rd('wind')?.speed,'jpg-fnugg-block')
						 }>
						 <i className="fas fa-wind"></i>{this._rd('wind')?.mps ?? '-'}
						 <small>m/s</small>&nbsp; 						 
						 <small>{this.props.__(this._rd('wind')?.speed,'jpg-fnugg-block')}</small>&nbsp;
						 <i class="fas fa-arrow-up" style={{transform: this.windDirection( this._rd('wind')?.name ) }}></i>
					</span>

				</div>
				<div className="jpgfnugg-container__profile">
		 			<div className="jpgfnugg-container__profile__text">
		  				<h2>{this._rd('name')}</h2>
						<p>{this._rd('condition')} {this.props.__('Updated','jpg-fnugg-block')}: <b>{this._rd('last_updated')} </b></p>
		 			</div>
				</div>
	   		</div>
	   </div>
	   )
	}
}

export default FnuggCard;