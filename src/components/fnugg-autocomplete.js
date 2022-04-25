import { Spinner } from '@wordpress/components';
import { isEmpty } from 'lodash';
import { TextControl, Button } from '@wordpress/components';
class FnuggAutocomplete extends React.Component {
    constructor(props){
        super(props);        
        this.state = {
            options: [],
            value:this.props.attrs?.resortData?.name,
            disabled:true,
            busy: false,
            typingTimeOut:null,
            isStillTyping:false,
            error:false,
        }
        
        this.onChangeValue = this.onChangeValue.bind(this);
        this.handleClick = this.handleClick.bind(this);        
        this.typing = this.typing.bind(this);
        this._resortExist =this._resortExist.bind(this);
        this.isBusy =this.isBusy.bind(this);
        this.showNotice =this.showNotice.bind(this);
        this.handleError =this.handleError.bind(this);
    }
    componentDidMount(){
        //if there is a saved result, add it as an initial and unique option. 
        if (this.props.attrs?.resortData?.name || false){
            this.setState({options:[ this.props.attrs?.resortData?.name ]});
        }
    }

    _resortExist(){
        let val = this.state.value;
        const exist  = (element) => element.trim().toLowerCase() === val.trim().toLowerCase();
        return this.state.options.some(exist);
    }
    typing(val){
        //this function guarantees a grace time before fetching using a timeout.
        if(this.state.typingTimeOut)
            clearTimeout(this.state.typingTimeOut);
        this.setState({isStillTyping:true,error:false});
        let comp = this;
        this.setState({value:val},function(){
            if(!comp._resortExist())                            
                comp.state.typingTimeOut = setTimeout(comp.onChangeValue, 400,val);
            else{
                comp.fecthResort(val).catch(comp.handleError);
            }
        })        
    }
    async getResorts(q){  
        //function that fetchs the resort info that will be pass to the FnuggCard component  
        if(this.isBusy() || this.state.isStillTyping)
            return;
        this.setState( {disabled: true, busy:true})
        let comp = this;//for avoiding further 'this' scope problem. 
        let o = [];
        try {
            const response = await fetch('/wp-json/jpg-fnugg-api/v1/autocomplete/'+q);
            if(response.ok){
                const data = await response.json();
                o = Object.values(data);
                
            }else{
                comp.handleError(error);
            }    
        } catch (error) {
            comp.handleError(error);
        }
        return o;
    }
    async fecthResort(q){
        //function that fetchs the resort info that will be pass to the FnuggCard component
        if(this.isBusy())return;
        let comp = this;//for avoiding further 'this' scope problem. 
        this.setState( {busy:true}, async function(){
            try {
                const response = await fetch('/wp-json/jpg-fnugg-api/v1/search/'+q);
                if(response.ok){
                    const data = await response.json();
                    comp.props.onChange(data);    
                    comp.setState( {disabled: false, busy:false})
                }else{
                    comp.handleError(error);
                }    
            } catch (error) {
                comp.handleError(error);
            }            
            
        })
    }
    async onChangeValue ( val ){
        this.setState({isStillTyping:false});
        if(this.isBusy())
            return;
        let comp = this;
        this.setState({options: [] },async function(){
            if(val.length >  1)
                comp.setState({options:  await comp.getResorts(val).catch(comp.handleError)   })
            comp.setState( {disabled: !comp._resortExist(), busy:false })
        })
    }
    handleError(error){
        console.error(error);
        this.setState( {disabled: false, busy:false, error:true})
    }
    handleClick(){
        this.fecthResort(this.state.value).catch(this.handleError);
    }
    isBusy(){
        return this.state.busy;
    }
    isError(){
        return this.state.error;
    }
    showNotice(){
        if(this.isError()){
            return <span className="jpg-fnugg-block-error">{this.props.__('There was an error processing the query.','jpg-fnugg-block')}</span>
        }
        if(this.isBusy()){
            return (<div><Spinner/><span>{this.props.__('Please wait...','jpg-fnugg-block')}</span></div>)
        }else{
            return isEmpty( this.state.options ) ? this.props.__('No resorts found. Please make a new search.','jpg-fnugg-block'):'';
        }
    }

    render() {
        
        const blockId = `fnugg-autocomplete-${ this.props.id }`;
        return (
            <div>
                <TextControl
                list={ blockId }
                label={this.props.__('Search a resort: ','jpg-fnugg-block')}
                value={ this.state.value } 
                onChange={ this.typing }
                autoComplete="off"
                />
                <datalist id={ blockId }>
                    { this.state.options.map( ( option, index ) => <option value={option} readonly/>) }
                </datalist>
                <Button variant='secondary' onClick={ this.handleClick} isBusy={ this.isBusy() }>
                    {this.props.__('Refresh resort info','jpg-fnugg-block') }
                </Button>
                <br />
                <label>{  this.showNotice()  } </label>
            </div>
        )
    }
}

export default FnuggAutocomplete;