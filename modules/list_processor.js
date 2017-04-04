/*
 * Process SVN lists
 */

/**
 * Recursive function that converts tree structure to the format required by jsTree library
 * @param {Object} subtree - output of build_tree
 * @param {String} node_name
 * @return {Object} tree - tree structure required by jsTree library
 */
const traverse_tree = function(subtree, node_name){
    var children = [];
    for (var subroot in subtree){
        if(subtree[subroot] === 'file'){
            children.push({ text: subroot, icon:'fa fa-file'});
        }
        else{
            children.push(traverse_tree(subtree[subroot], subroot)); 
        }
    }

    return {
        text: node_name,
        children: children,
        icon:'fa fa-folder'
    };
};

module.exports = {
    /**
     * Build a tree structure from list of file
     * @param {Object} list - output of parse_list
     * @return {Object} tree
     */
    build_tree : function(list){
        var tree = {};
        for (var i = 0; i < list.length; ++i){
            if(list[i].kind === 'dir'){
                var path = list[i].name.split('/');
                var dict = tree;
                for(var j = 0; j < path.length; ++j){
                    if(!dict[path[j]]){
                        dict[path[j]] = {};
                    }
                    dict = dict[path[j]];
                }
            }
        }
        for (var i = 0; i < list.length; ++i){
            if(list[i].kind === 'file'){
                var path = list[i].name.split('/');
                var dict = tree;
                var j;
                for(j = 0; j < path.length - 1; ++j){
                    dict = dict[path[j]];
                }
                dict[path[j]] = 'file';
            }
        }
        return tree;
    },

    /**
     * Extract information about file size from the list
     * @param {Object} list - output of parse_list
     * @return {Object} size_dict
     */
    extract_size: function(list){
        var size_dict = {};
        for (var i = 0; i < list.length; ++i){
            var path = list[i].name.split('/');
            if(!(path[0] in size_dict)){
                size_dict[path[0]] = {};
            }
            if( list[i].size !== -1) {
                size_dict[path[0]][list[i].name] = list[i].size;
            }
        }
        return size_dict;
    },

    /**
     * Construct individual jsTrees for each project
     * @param {Object} tree - output of build_tree
     * @return {Object} jsTrees
     */
    output_jsTrees : function(tree){
        var jsTrees = {};
        for (var project in tree){
            if(tree[project] != 'file'){
                jsTrees[project] = traverse_tree(tree[project], project);
            }
        }
        return jsTrees;
    }
};