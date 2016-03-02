<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ContentAssessor
 *
 * @ORM\Table(name="Users.Content_Assessor", uniqueConstraints={@ORM\UniqueConstraint(name="Assessor_ID_UNIQUE", columns={"Assessor_ID"})}, indexes={@ORM\Index(name="fk_Content_Assessor_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class ContentAssessor
{
    /**
     * @var integer
     *
     * @ORM\Column(name="Assessor_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $assessorId;

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;



    /**
     * Get assessorId
     *
     * @return integer
     */
    public function getAssessorId()
    {
        return $this->assessorId;
    }

    /**
     * Set user
     *
     * @param \AppBundle\Entity\UserTable $user
     *
     * @return ContentAssessor
     */
    public function setUser(\AppBundle\Entity\UserTable $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }
}
