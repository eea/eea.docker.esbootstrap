function viewReady(){
    addHeaders("#facetview_results");
}

jQuery(document).ready(function($) {
    var default_sort = [{'created':{"order": 'asc'}}];

    eea_facetview('.facet-view-simple', 
        {
            search_url: './api',
            search_index: 'elasticsearch',
            datatype: 'json',
            initial_search: false,
            enable_rangeselect: true,
            enable_geoselect: true,
            default_sort: default_sort,
            post_init_callback: function() {
              add_EEA_settings();
            },
            post_search_callback: function() {
              add_EEA_settings();
              viewReady();
            },
            paging: {
                from: 0,
                size: 10
            }
        });
});
