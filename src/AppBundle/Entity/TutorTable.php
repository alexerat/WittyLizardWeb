<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TutorTable
 *
 * @ORM\Table(name="Tutoring.Tutor_Table",
 * indexes={@ORM\Index(name="fk_Tutor_Table_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class TutorTable
{
    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;

    /**
     * @var \Doctrine\Common\Collections\Collection|TuteeTable[]
     *
     * @ORM\ManyToMany(targetEntity="TuteeTable", inversedBy="tutors")
     * @ORM\JoinTable(name="tutees", joinColumns={@ORM\JoinColumn(name="tuteeId", referencedColumnName="user")}, inverseJoinColumns={@ORM\JoinColumn(name="tutorId", referencedColumnName="user")})
     */
    protected $tutees;
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->tutees = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Set user
     *
     * @param \AppBundle\Entity\UserTable $user
     *
     * @return TutorTable
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

    /**
     * Add tutee
     *
     * @param \AppBundle\Entity\TuteeTable $tutee
     *
     * @return TutorTable
     */
    public function addTutee(\AppBundle\Entity\TuteeTable $tutee)
    {
        $this->tutees[] = $tutee;

        return $this;
    }

    /**
     * Remove tutee
     *
     * @param \AppBundle\Entity\TuteeTable $tutee
     */
    public function removeTutee(\AppBundle\Entity\TuteeTable $tutee)
    {
        $this->tutees->removeElement($tutee);
    }

    /**
     * Get tutees
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getTutees()
    {
        return $this->tutees;
    }
}
