package iit.components.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class SamplePageController {


    @RequestMapping(value = "/main-sample", method = RequestMethod.GET)
    public String main(){
        return "/sample/main";
    }

    @RequestMapping(value = "/grid-sample", method = RequestMethod.GET)
    public String gridSample(){
        return "/sample/gridSample";
    }

    @RequestMapping(value = "/search-grid-sample", method = RequestMethod.GET)
    public String searchGridSample(){
        return "/sample/searchGridSample";
    }

    @RequestMapping(value = "/search-grid-card-sample", method = RequestMethod.GET)
    public String searchGridCardSample(){
        return "/sample/searchGridCardSample";
    }

    @RequestMapping(value = "/form-sample", method = RequestMethod.GET)
    public String formSample(){
        return "/sample/formSample";
    }

    @RequestMapping(value = "/tab-sample", method = RequestMethod.GET)
    public String tabSample(){
        return "/sample/tabSample";
    }

    @RequestMapping(value = "/card-sample", method = RequestMethod.GET)
    public String cardSample(){
        return "/sample/cardSample";
    }

    @RequestMapping(value = "/exchange-panel-sample", method = RequestMethod.GET)
    public String exchangePanelSample(){
        return "/sample/exchangePanelSample";
    }

    @RequestMapping(value = "/button-sample", method = RequestMethod.GET)
    public String buttonSample(){
        return "/sample/buttonSample";
    }

    @RequestMapping(value = "/horizontal-sample", method = RequestMethod.GET)
    public String horizontalSample(){
        return "/sample/horizontalSample";
    }

    @RequestMapping(value = "/vertical-sample", method = RequestMethod.GET)
    public String verticalSample(){
        return "/sample/verticalSample";
    }

    @RequestMapping(value = "/alert-sample", method = RequestMethod.GET)
    public String alertSample(){
        return "/sample/alertSample";
    }

    @RequestMapping(value = "/modal-sample", method = RequestMethod.GET)
    public String modalSample(){
        return "/sample/modalSample";
    }

}