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
        const exist  = (element) => element.name.trim().toLowerCase() === val.trim().toLowerCase();
        return this.state.options.some(exist);
    }
    typing(e){
        this.setState({isStillTyping:true});
        if(this.state.typingTimeOut)
            clearTimeout(this.state.typingTimeOut);
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
        if(this.isBusy() || this.isStillTyping)return;
        this.setState( {disabled: true, busy:true})
        const response = await fetch('/wp-json/jpg-fnugg-api/v1/autocomplete/'+q);
        const data = await response.json();
        let o = data.result;
        if(! isEmpty( o ))
            this.setState({options:o})
        else this.setState({options:[]})
        return ;
    }
    async fecthResort(q){
        if(this.isBusy())return;
        let comp = this;
        this.setState( {busy:true}, async function(){
            const response = await fetch('/wp-json/jpg-fnugg-api/v1/search/'+q);
            const data = await response.json();
            console.log("fecthResort",data);
            comp.props.onChange(data);
            comp.setState( {disabled: false, busy:false})
        })      
    }
    async onChangeValue ( val ){
        console.log('onChangeValue');
        if(this.isBusy() || this.isStillTyping)return;
        this.setState({isStillTyping:false});
        const exist  = (element) => element.name == val;
        if(val.length <= 1){
            this.setState({options:[]})
        }else{
            await this.getResorts(val)
        }
        let resortExist = this.state.options.some(exist);
        this.setState( {disabled: !resortExist, busy:false })
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
                    { this.state.options.map( ( option, index ) => <option value={ option.name } readonly/>) }
                </datalist>
                <button onClick={ this.handleClick} disabled={ this.state.disabled }>
                    Refresh
                </button>
                <br/>
                <label>{  this.checkOptions()  } </label>
            </div>
        )
    }
}

export default FnuggAutocomplete;