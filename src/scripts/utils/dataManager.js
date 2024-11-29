const dataManager = (function() {
    let items = [];
    let colors = {};

    function addItem(name) {
        items.push(name);
    }

    function removeItem(name) {
        items = items.filter(n => n !== name);
        delete colors[name];
    }

    function getItems() {
        return items;
    }

    function setColors(newColors) {
        colors = newColors;
    }

    function getColors() {
        return colors;
    }

    function clearData() {
        items = [];
        colors = {};
    }

    return {
        addItem,
        removeItem,
        getItems,
        setColors,
        getColors,
        clearData
    };
})();

window.dataManager = dataManager;