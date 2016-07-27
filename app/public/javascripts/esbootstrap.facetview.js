function fixDataTitles(){
    var th_list = [];
    $("#facetview_results thead th").each(function(idx, th){
        th_list.push($(th).text());

    })
    $("#facetview_results tr").each(function(tr_idx, tr){
        $(tr).find("td").each(function(td_idx, td){
            $(td).attr("data-title", th_list[td_idx]);
        });
    });
}

function viewReady(){
    addHeaders("#facetview_results");
    fixDataTitles();
}


function replaceNumbers(){
    var possibleContainers = ['a', 'td', 'th'];
    var chemsMapping = {'CH4':'CH<sub>4</sub>',
                        'CO2':'CO<sub>2</sub>',
                        'SO2':'SO<sub>2</sub>',
                        'O3':'O<sub>3</sub>',
                        'N2O':'N<sub>2</sub>O',
                        'NO2':'NO<sub>2</sub>',
                        'NOx':'NO<sub>x</sub>',
                        'NH3':'NH<sub>3</sub>',
                        'C6H6':'C<sub>6</sub>H<sub>6</sub>',
                        'SF6':'SF<sub>6</sub>'};
    jQuery.each(possibleContainers, function(idx, container){
        var elems = jQuery(container);
        jQuery.each(elems, function(idx, elem){
            if ((jQuery(elem).children().length === 0) || (container === 'a')){
                var shouldReplace = false;
                var replacedText = jQuery(elem).html();
                jQuery.each(chemsMapping, function(key, value){
                    if (replacedText.indexOf(key) !== -1){
                        replacedText = replacedText.split(key).join(value);
                        shouldReplace = true;
                    }
                });
                if (shouldReplace){
                    jQuery(elem).html(replacedText);
                }
            }
        });
    });
}


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
