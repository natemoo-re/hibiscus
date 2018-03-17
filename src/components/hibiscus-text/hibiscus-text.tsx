import { Component, State, Prop, Method, Element, Watch} from '@stencil/core';

@Component({
  tag: 'hibiscus-text',
  styleUrl: 'hibiscus-text.css',
  shadow: true,
  host: {
    theme: 'icon'
  },
  assetsDir: 'svg'
})
export class HibiscusTextComponent {
  @Element() host: HTMLElement;
  @State() private svgContent: string = null;

  @Prop({ context: 'isServer' }) private isServer: boolean;

  @Prop({ context: 'publicPath' }) private publicPath: string;

  @Prop() text: string = '';
  @State() hasPlayed: boolean = false;

  @Watch('svgContent') onSVGContentChanged() {
    this.host.classList.add('active');
    this.play();
  }

  @Method() play() {
    if (!this.hasPlayed) {
      console.log('PLAY');
      const children = this.host.shadowRoot.querySelector('.text-inner').children;
      setTimeout(() => {
        Array.from(children).forEach((child, i) => {
          console.log('CHILD', child);
          child.setAttribute('style', `--index: ${i}; --path-length: ${child.querySelector('path').getTotalLength()}px;`)
          // child.classList.add('active');
        })
      }, 0)
    }
    this.hasPlayed = true;
  }

  render() {
    if (this.isServer) {
      return <div class="text-inner">{/* ssr */}</div>;
    }

    const iconName = this.text;
    if (!iconName) {
      // we don't have good data
      return <div class="text-inner">{/* invalid svg */}</div>;
    }

    let svgContentTemp = '';
    iconName.split("").forEach(char => svgContentTemp += svgContents[char])
    const svgContent = svgContentTemp;
    if (svgContent === this.svgContent) {
      // we've already loaded up this svg at one point
      // and the svg content we've loaded and assigned checks out
      // render this svg!!
      return <div class="text-inner" innerHTML={svgContent}></div>;
    }



    // haven't loaded this svg yet
    // start the request
    let content = '';
    let loaded = 0;
    iconName.split("").forEach((char) => {
      loadSvgContent(char, this.publicPath, loadedSvgContent => {
        // we're finished loading the svg content!
        // set to this.svgContent so we do another render
        if (loaded < this.text.length) {
          content += loadedSvgContent;
          // console.log(`LOADED ${loaded}`, content)
          loaded++;
          if (loaded === this.text.length) {
            console.log('COMPLETED');
            this.svgContent = content;
          }
        }
      });
    })

    // actively requesting the svg, so let's just render a div for now
    return <div class="text-inner">{/* loading svg */}</div>;
  }

}


function loadSvgContent(char: string, publicPath: string, callback: { (loadedSvgContent: string): void }) {
  // static since all IonIcons use this same function and pointing at global/shared data
  // passed in callback will have instance info
  // add to the list of callbacks to fiure when this url is finished loading
  (loadCallbacks[char] = loadCallbacks[char] || []).push(callback);

  if (activeRequests[char]) {
    // already requesting this icon, don't bother kicking off another
    return;
  }

  // add this icons to our list of active requests
  activeRequests[char] = true;


  // kick off the request for the external svg file
  // create a script element to add to the document.head
  var scriptElm = document.createElement('script');
  scriptElm.charset = 'utf-8';
  scriptElm.async = true;
  scriptElm.src = `${publicPath}svg/${char}.js`;

  // create a fallback timeout if something goes wrong
  var tmrId = setTimeout(onScriptComplete, 120000);

  function onScriptComplete() {
    clearTimeout(tmrId);
    scriptElm.onerror = scriptElm.onload = null;
    scriptElm.parentNode.removeChild(scriptElm);

    // remove from our list of active requests
    delete activeRequests[char];
  }

  // add script completed listener to this script element
  scriptElm.onerror = scriptElm.onload = onScriptComplete;

  // inject a script tag in the head
  // kick off the actual request
  document.head.appendChild(scriptElm);
}


const activeRequests: { [iconName: string]: boolean } = {};
const loadCallbacks: { [iconName: string]: { (loadedSvgContent: string): void }[] } = [] as any;
const svgContents: { [iconName: string]: string } = {};

// add a jsonp handler to the window
// as svg jsonp files are requested
// once they load they'll call this method
(window as any).loadIonicon = function loadIonicon(svgContent: string, iconName: string) {
  // awesome, we've finished loading the svg file
  // remove this url from the active requests
  delete activeRequests[iconName];

  svgContents[iconName] = svgContent

  // find any callbacks waiting on this icon
  const svgLoadCallbacks = loadCallbacks[iconName];
  if (svgLoadCallbacks) {
    // loop through all the callbacks that are waiting on the svg content
    svgLoadCallbacks.forEach(cb => {
      // fire off this callback which was provided by an instance
      cb(svgContent);
    });
    delete loadCallbacks[iconName];
  }


}
