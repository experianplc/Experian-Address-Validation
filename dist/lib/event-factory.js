/**
 * Method event listener (pub/sub type thing)
 */
var EventFactory = /** @class */ (function () {
    function EventFactory() {
        // Create an object to hold the collection of events
        this.collection = {};
    }
    // Subscribe a new event
    EventFactory.prototype.on = function (event, action) {
        // Create the property array on the collection object
        this.collection[event] = this.collection[event] || [];
        // Push a new action for this event onto the array
        this.collection[event].push(action);
    };
    // Publish (trigger) an event
    EventFactory.prototype.trigger = function (event, data) {
        // If this event is in our collection (i.e. anyone's subscribed)
        if (this.collection[event]) {
            // Loop over all the actions for this event
            for (var i = 0; i < this.collection[event].length; i++) {
                // Create array with default data as 1st item
                var args = [data];
                // Loop over additional args and add to array
                for (var a = 2; a < arguments.length; a++) {
                    args.push(arguments[a]);
                }
                // Call each action for this event type, passing the args
                try {
                    this.collection[event][i].apply(this.collection, args);
                }
                catch (e) {
                    // What to do? Uncomment the below to show errors in your event actions
                    //console.error(e);
                }
            }
        }
    };
    return EventFactory;
}());
export default EventFactory;
//# sourceMappingURL=event-factory.js.map