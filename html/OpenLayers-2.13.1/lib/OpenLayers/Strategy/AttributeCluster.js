/**
 *  *  * Class: OpenLayers.Strategy.AttributeCluster
 *   *   * Strategy for vector feature clustering based on feature attributes.
 *    *
 *     * Inherits from:
 *      *  - <OpenLayers.Strategy.Cluster>
 *      */
OpenLayers.Strategy.AttributeCluster = OpenLayers.Class(OpenLayers.Strategy.Cluster, {
/**
 *  * the attribute to use for comparison
 *  */
    attribute: null,
/**
 * * Method: shouldCluster
 *  * Determine whether to include a feature in a given cluster.
 *   *
 *    * Parameters:
 *     * cluster - {<OpenLayers.Feature.Vector>} A cluster.
 *      * feature - {<OpenLayers.Feature.Vector>} A feature.
 *       *
 *        * Returns:
 *         * {Boolean} The feature should be included in the cluster.
 *         */
    shouldCluster: function(cluster, feature) {
        var cc_attrval = cluster.cluster[0].attributes[this.attribute];
        var fc_attrval = feature.attributes[this.attribute];
        var superProto = OpenLayers.Strategy.Cluster.prototype;
        return cc_attrval === fc_attrval &&
            superProto.shouldCluster.apply(this, arguments);
    },
    CLASS_NAME: "OpenLayers.Strategy.AttributeCluster"
});

