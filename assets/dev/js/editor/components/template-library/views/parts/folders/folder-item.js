module.exports = Marionette.ItemView.extend( {
    tagName: 'li',
    template: _.template( '<%= title %>' ),

    attributes() {
        const data = this.model.toJSON();

        return {
            'data-id': data.template_id,
            'data-value': data.title,
        };
    },

    render() {
        this.$el.html( this.template( this.model.toJSON() ) );

        return this;
    },
} );
