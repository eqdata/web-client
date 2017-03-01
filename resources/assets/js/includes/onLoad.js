/**
 * Created by Rocky on 3/1/2017.
 */
import search from "../utils/search";
import serverSelect from "../utils/serverSelect";

window.onload = function(){
    search.addSearchListener();
    serverSelect.setLabel();
    serverSelect.setToggleListener();
};