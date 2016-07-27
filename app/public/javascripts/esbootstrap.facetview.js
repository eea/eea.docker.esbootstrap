jQuery(document).ready(function($) {
    var default_sort = [];
    eea_facetview('.facet-view-simple', 
        {
            search_url: './api',
            search_index: 'elasticsearch',
            datatype: 'json',
            initial_search: false,
            enable_rangeselect: true,
            enable_geoselect: true,
            default_sort: default_sort,
            search_sortby: [
              {
                'field': 'title',
                'display_asc': 'Title a-z',
                'display_desc': 'Title z-a'
              },
              {
                'field': 'created',
                'display_asc': 'Oldest',
                'display_desc': 'Newest'
              }
            ],
            sort: [{'created': {'order': 'desc'}}
            ],
            post_init_callback: function() {
              add_EEA_settings();
              replaceNumbers();
            },
            post_search_callback: function() {
              add_EEA_settings();
              viewReady();
              replaceNumbers();
            },
            paging: {
                from: 0,
                size: 10
            }
        });
});
