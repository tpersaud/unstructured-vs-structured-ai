using Microsoft.AspNetCore.Mvc;
using SampleApp.Web.Controllers;
using Xunit;

namespace SampleApp.Tests;

public class HomeControllerTests
{
    [Fact]
    public void Index_ReturnsViewResult()
    {
        var controller = new HomeController();
        var result = controller.Index();
        Assert.IsType<ViewResult>(result);
    }

    [Fact]
    public void Index_ReturnsNonNull()
    {
        var controller = new HomeController();
        var result = controller.Index();
        Assert.NotNull(result);
    }
}
