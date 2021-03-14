<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * CourseProviders
 *
 * @ORM\Table(name="Online_Courses.Course_Providers", indexes={@ORM\Index(name="fk_Course_Providers_User_Table1_idx", columns={"User_ID"})}),
 * uniqueConstraints={@ORM\UniqueConstraint(name="Provider_ID_UNIQUE", columns={"Provider_ID"})})
 * @ORM\Entity
 */
class CourseProviders
{
    /**
     * @var integer
     *
     * @ORM\Column(name="Provider_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
    */
    private $provId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Admin_ID", referencedColumnName="User_ID")
     * })
     */
    private $adminId;
}
