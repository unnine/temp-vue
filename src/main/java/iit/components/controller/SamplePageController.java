package iit.components.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class SamplePageController {


    @RequestMapping(value = "/main", method = RequestMethod.GET)
    public String main(){
        return "main";
    }

    @RequestMapping(value = "/grid-sample", method = RequestMethod.GET)
    public String gridSample(){
        return "gridSample";
    }

    @RequestMapping(value = "/search-grid-sample", method = RequestMethod.GET)
    public String searchGridSample(){
        return "searchGridSample";
    }

    @RequestMapping(value = "/search-grid-card-sample", method = RequestMethod.GET)
    public String searchGridCardSample(){
        return "searchGridCardSample";
    }

    @RequestMapping(value = "/form-sample", method = RequestMethod.GET)
    public String formSample(){
        return "formSample";
    }

    @RequestMapping(value = "/tab-sample", method = RequestMethod.GET)
    public String tabSample(){
        return "tabSample";
    }

}