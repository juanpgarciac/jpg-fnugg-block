import { Spinner } from '@wordpress/components';

class FnuggAutocomplete extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            options: [],
            value:'',
            disabled:true,
            busy: false
        }
        this.onChangeValue = this.onChangeValue.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    getResorts(q){
        let o = [
            { 'value': 'First option' },
            { 'value': 'Second option' },
            { 'value': 'Third option' }
        ]
        return o.filter ( resort => resort.value.toLowerCase().startsWith(q.toLowerCase()));
    }
    onChangeValue ( event ){
        this.setState( {disabled: true, busy:true})
        let val = event.target.value;
        this.setState({value:val})
        if(val.length <= 1){
            this.setState({options:[]})
        }else{
            this.setState({options:this.getResorts(val)})
        }
        const exist  = (element) => element.value == val;
        let status = !this.state.options.some(exist);
        this.setState( {disabled: status, busy:false })
    }
    handleClick(){
        //fetch resort info and insert block. 
    }
    checkBusy(){
        if (this.state.busy){
            return <Spinner/>
        }else{
            return "Add resort block"
        }
    }

    render() {
        
        const blockId = `fnugg-autocomplete-${ this.props.id }`;
        return (
            <div>
                <label for={ blockId }>{ this.props.label }</label>
                <input list={ blockId } value={ this.state.value } onInput={ this.onChangeValue }/>
                <datalist id={ blockId }>
                    { this.state.options.map( ( option, index ) =>
                    <option value={ option.value } label={ option.label } />
                    ) }
                </datalist>
                
                <button onClick={ this.handleClick} disabled={ this.state.disabled }>
                    {this.checkBusy()}                    
                </button>
            </div>
        )
    }
}

export default FnuggAutocomplete;