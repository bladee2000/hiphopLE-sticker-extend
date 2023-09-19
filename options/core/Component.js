export default class Component {
    target;
    state;
    
    constructor (target, props) {
      this.target = target;
      this.props = props
      this.setup();
      this.render();
      this.afterFirstRender();
      this.setEvent();
    }
    
    setup () {};

    template () { return ''; }

    render () {
      this.target.innerHTML = this.template();
      this.mounted()
    }
    
    mounted() {}

    afterFirstRender() {}

    setEvent () {}

    setState (newState) {
      this.state = { ...this.state, ...newState };
      this.render();
    }
    
    addEvent (eventType, selector, callback) {
        this.target.addEventListener(eventType, event => {
          if (!event.target.closest(selector)) return false;
          callback(event);
        })
      }

    
  }