import { SideBar } from '../SideBar';
import { TopBar } from '../TopBar';
import '../ReactDeclarations';

declare var ReactDOM: any;
declare var React: any;

var siteHeader;
var sideBarEl;

siteHeader = ReactDOM.render(React.createElement(TopBar, null), document.getElementById('site-header'));
sideBarEl = ReactDOM.render(React.createElement(SideBar, null), document.getElementById('offCanvasLeft'));