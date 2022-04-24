import { Spinner } from '@wordpress/components';
import { isEmpty } from 'lodash';

class FnuggAutocomplete extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            options: [],
            value:this.props.attrs?.resortData?.name,
            disabled:true,
            busy: false,
            typingTimeOut:null,
            isStillTyping:false
        }
        this.onChangeValue = this.onChangeValue.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.typing = this.typing.bind(this);
        this._resortExist =this._resortExist.bind(this);
        this.isBusy =this.isBusy.bind(this);
        this.checkOptions =this.checkOptions.bind(this);
    }
    _resortExist(){
        let val = this.state.value;
        const exist  = (element) => element.trim().toLowerCase() === val.trim().toLowerCase();
        return this.state.options.some(exist);
    }
    typing(e){
        if(this.state.typingTimeOut)
            clearTimeout(this.state.typingTimeOut);
        this.setState({isStillTyping:true});
        let val = e.target.value;
        let comp = this;
        this.setState({value:val},function(){
            if(!comp._resortExist())                            
                comp.state.typingTimeOut = setTimeout(comp.onChangeValue, 500,val);
            else{
                this.fecthResort(val);
            }
        })        
    }
    async getResorts(q){    
        if(this.isBusy() || this.isStillTyping)
            return;

        this.setState( {disabled: true, busy:true})
        const response = await fetch('/wp-json/jpg-fnugg-api/v1/autocomplete/'+q).catch((error) => {console.log(error)});
        let o = [];
        if(response.ok){
            const data = await response.json();
            o = Object.values(data);
        }
        return o;
    }
    async fecthResort(q){
        if(this.isBusy())return;
        let comp = this;
        this.setState( {busy:true}, async function(){
            const response = await fetch('/wp-json/jpg-fnugg-api/v1/search/'+q).catch((error) => {console.log(error)});
            if(response.ok){
                const data = await response.json();
                comp.props.onChange(data);    
            }else{

            }
            comp.setState( {disabled: false, busy:false})
        })      
    }
    async onChangeValue ( val ){
        if(this.isBusy() || this.isStillTyping)
            return;

        this.setState({isStillTyping:false});
        let comp = this;
        if(val.length >  1)
            this.setState({options:  await comp.getResorts(val)   })
        else
            this.setState({options:  [] })
        this.setState( {disabled: !comp._resortExist(), busy:false })
    }
    handleClick(){
        this.fecthResort(this.state.value);
    }
    isBusy(){
        return this.state.busy;
    }
    checkOptions(){
        if(this.isBusy()){
            return <div><Spinner/><span>Please wait. Looking for resorts...</span></div>
        }else{
            return (isEmpty( this.state.options ) || !this._resortExist())? 'No resorts found. Please make a new search.':'';
        }
    }

    render() {
        
        const blockId = `fnugg-autocomplete-${ this.props.id }`;
        return (
            <div>
                <label for={ blockId }>{ this.props.label }</label>
                <input list={ blockId } value={ this.state.value } onInput={ this.typing }/>
                <datalist id={ blockId }>
                    { this.state.options.map( ( option, index ) => <option value={option} readonly/>) }
                </datalist>
                <button onClick={ this.handleClick} disabled={ this.state.disabled }>
                    Refresh resort info
                </button>
                <br/>
                <label>{  this.checkOptions()  } </label>
            </div>
        )
    }
}

export default FnuggAutocomplete;