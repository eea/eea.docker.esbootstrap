jQuery(document).ready(function($) {
    var opts = {
        search_url: './api',
        search_index: 'elasticsearch',
        datatype: 'json',
        initial_search: false,
        enable_rangeselect: true,
        enable_geoselect: true,
        default_sort: [],
        search_sortby: settings_search_sortby,
        sort: settings_sort,
        post_init_callback: function() {
            add_EEA_settings();
            replaceNumbers();
            $(window).trigger('eea_post_init_callback');
        },
        post_search_callback: function() {
            add_EEA_settings();
            viewReady();
            replaceNumbers();
            $(window).trigger('eea_post_search_callback');
        },
        paging: {
            from: 0,
            size: 10
        },
        display_type_options: settings_display_options,
        display_type: settings_default_display
    };
    if (window.esbootstrap_options) {
       $.extend(opts, esbootstrap_options);
    }
    eea_facetview('.facet-view-simple', opts);
});
