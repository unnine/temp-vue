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

    @RequestMapping(value = "/card-sample", method = RequestMethod.GET)
    public String cardSample(){
        return "cardSample";
    }

    @RequestMapping(value = "/exchange-panel-sample", method = RequestMethod.GET)
    public String exchangePanelSample(){
        return "exchangePanelSample";
    }

    @RequestMapping(value = "/button-sample", method = RequestMethod.GET)
    public String buttonSample(){
        return "buttonSample";
    }

    @RequestMapping(value = "/horizontal-sample", method = RequestMethod.GET)
    public String horizontalSample(){
        return "horizontalSample";
    }

    @RequestMapping(value = "/vertical-sample", method = RequestMethod.GET)
    public String verticalSample(){
        return "verticalSample";
    }

    @RequestMapping(value = "/alert-sample", method = RequestMethod.GET)
    public String alertSample(){
        return "alertSample";
    }

    @RequestMapping(value = "/modal-sample", method = RequestMethod.GET)
    public String modalSample(){
        return "modalSample";
    }

}